/* eslint-disable react-hooks/exhaustive-deps */
// D:\Aura\frontend\src\components\Quiz.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { FunnelContext } from '../App';
import { quizQuestions, trackEvent } from '../mock';
import { supabase } from '../lib/supabaseClient';
import { getOrInitSessionId } from '../utils/visitorTracking';

const QUIZ_TRACKING_TABLE = 'quiz_tracking';

const Quiz = () => {
  const navigate = useNavigate();
  const { funnelData, setFunnelData } = useContext(FunnelContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [shouldAutoAdvance, setShouldAutoAdvance] = useState(false);
  const didRecordStartRef = useRef(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  // Initialize session and ensure it's consistent
  useEffect(() => {
    console.log('[SUPABASE] URL presente:', !!import.meta.env.VITE_SUPABASE_URL);
    console.log('[SUPABASE] ANON KEY presente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    console.log('[QUIZ] Montado. currentQuestionIndex=', currentQuestionIndex);

    // Always get or create session ID and ensure it's in the funnel data
    const sid = getOrInitSessionId();
    console.log('[QUIZ] Session ID:', sid);
    
    // Update funnel data with the session ID if it's not set or different
    if (sid && (!funnelData?.sessionId || funnelData.sessionId !== sid)) {
      console.log('[QUIZ] Updating session ID in funnel data');
      setFunnelData(prev => ({ ...prev, sessionId: sid }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para guardar respuestas en Supabase
  const saveAnswersToSupabase = async (sessionId, answers) => {
    if (!sessionId) {
      console.error('[QUIZ] No session ID available for saving answers');
      return;
    }
    
    console.log('[SUPABASE] Intentando guardar respuestas:', { sessionId, answers });
    
    try {
      // Primero verificamos si ya existe un registro
      const { data: existingRecord, error: fetchError } = await supabase
        .from(QUIZ_TRACKING_TABLE)
        .select('session_id')
        .eq('session_id', sessionId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('[SUPABASE] Error al verificar registro existente:', fetchError);
        throw fetchError;
      }

      const payload = {
        session_id: sessionId,
        answers: answers,
        updated_at: new Date().toISOString()
      };

      if (existingRecord) {
        // Actualizar registro existente
        const { data: updateData, error: updateError } = await supabase
          .from(QUIZ_TRACKING_TABLE)
          .update(payload)
          .eq('session_id', sessionId);

        if (updateError) {
          console.error('[SUPABASE] Error al actualizar respuestas:', updateError);
          throw updateError;
        }
        console.log('[QUIZ] ✅ Respuestas actualizadas correctamente');
      } else {
        // Insertar nuevo registro
        console.log('[SUPABASE] Creando nuevo registro de respuestas...');
        const { data: insertData, error: insertError } = await supabase
          .from(QUIZ_TRACKING_TABLE)
          .insert([{ ...payload, created_at: new Date().toISOString() }]);

        if (insertError) {
          console.error('[SUPABASE] Error al crear registro:', insertError);
          throw insertError;
        }
        console.log('[QUIZ] ✅ Nuevo registro de respuestas creado correctamente');
      }
    } catch (e) {
      console.error('[SUPABASE] Exception en upsert quiz_tracking:', e);
    }
  };

  // 🔹 REGISTRA INICIO DE QUIZ EN SUPABASE (solo una vez)
  useEffect(() => {
    const recordQuizStart = async () => {
      // Always get the latest session ID to ensure consistency
      const sessionId = getOrInitSessionId();
      console.log('[QUIZ] Using session ID for quiz start:', sessionId);

      console.log('[QUIZ] recordQuizStart() disparado', {
        currentQuestionIndex,
        sessionId,
        table: QUIZ_TRACKING_TABLE,
      });

      const payload = {
        session_id: sessionId,
        quiz_started: true,
        start_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      try {
        // Primero verificamos si ya existe un registro
        const { data: existingRecord, error: fetchError } = await supabase
          .from(QUIZ_TRACKING_TABLE)
          .select('session_id')
          .eq('session_id', sessionId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('[SUPABASE] Error al verificar registro existente:', fetchError);
          throw fetchError;
        }

        if (existingRecord) {
          // Actualizar registro existente
          const { data: updateData, error: updateError } = await supabase
            .from(QUIZ_TRACKING_TABLE)
            .update(payload)
            .eq('session_id', sessionId);

          if (updateError) {
            console.error('[SUPABASE] Error al actualizar inicio de quiz:', updateError);
            throw updateError;
          }
          console.log('[QUIZ] ✅ Inicio de quiz actualizado correctamente');
        } else {
          // Insertar nuevo registro
          console.log('[QUIZ] Creando nuevo registro de inicio de quiz...');
          const { data: insertData, error: insertError } = await supabase
            .from(QUIZ_TRACKING_TABLE)
            .insert([{ 
              ...payload, 
              created_at: new Date().toISOString() 
            }]);

          if (insertError) {
            console.error('[SUPABASE] Error al crear registro de inicio de quiz:', insertError);
            throw insertError;
          }
          console.log('[QUIZ] ✅ Nuevo registro de inicio de quiz creado correctamente');
        }
      } catch (e) {
        console.error('[SUPABASE] Exception en upsert quiz_tracking:', e);
      }
    };

    if (currentQuestionIndex === 0 && !didRecordStartRef.current) {
      didRecordStartRef.current = true;
      recordQuizStart();
    } else {
      console.log('[QUIZ] recordQuizStart() NO ejecutado:', {
        currentQuestionIndex,
        alreadyRan: didRecordStartRef.current
      });
    }
  }, [currentQuestionIndex, funnelData?.sessionId]);

  // track de vista de paso
  useEffect(() => {
    console.log('[QUIZ] step_view -> index:', currentQuestionIndex, 'question_id:', currentQuestion?.id);
    trackEvent('quiz_step_view', {
      step_index: currentQuestionIndex + 1,
      question_id: currentQuestion.id,
    });
  }, [currentQuestionIndex, currentQuestion?.id]);

  const handleAnswerSelect = (optionId, isMultiSelect = false) => {
    console.log('[QUIZ] handleAnswerSelect()', { optionId, isMultiSelect, qid: currentQuestion.id });

    let newAnswer;

    if (isMultiSelect) {
      const currentAnswers = selectedAnswers[currentQuestion.id] || [];
      if (currentAnswers.includes(optionId)) {
        newAnswer = currentAnswers.filter((id) => id !== optionId);
      } else {
        newAnswer = [...currentAnswers, optionId];
      }
    } else {
      newAnswer = optionId;
    }

    const newSelectedAnswers = {
      ...selectedAnswers,
      [currentQuestion.id]: newAnswer,
    };

    setSelectedAnswers(newSelectedAnswers);

    trackEvent('quiz_answer', {
      step_index: currentQuestionIndex + 1,
      question_id: currentQuestion.id,
      option_id: optionId,
      is_multi_select: isMultiSelect,
    });

    // Always get the latest session ID to ensure consistency
    const sessionId = getOrInitSessionId();
    console.log('[QUIZ] Using session ID for answer save:', sessionId);
    saveAnswersToSupabase(sessionId, newSelectedAnswers);

    if (!isMultiSelect) {
      setTimeout(() => {
        handleNext();
      }, 600);
    }
  };

  // auto-avance para multi-select si lo activas en tu flujo
  useEffect(() => {
    if (shouldAutoAdvance) {
      const timer = setTimeout(() => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          setFunnelData((prev) => ({
            ...prev,
            answers: selectedAnswers,
            currentStep: 1,
          }));
          navigate('/lead-capture');
        }
        setShouldAutoAdvance(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [shouldAutoAdvance, currentQuestionIndex, selectedAnswers, navigate, setFunnelData]);

  const handleNext = () => {
    const progressPercent = ((currentQuestionIndex + 2) / quizQuestions.length) * 100;

    console.log('[QUIZ] handleNext()', { currentQuestionIndex, progressPercent });

    trackEvent('quiz_progress', {
      step_index: currentQuestionIndex + 1,
      progress_pct: progressPercent,
    });

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setFunnelData((prev) => ({
        ...prev,
        answers: selectedAnswers,
        currentStep: 1,
      }));
      navigate('/lead-capture');
    }
  };

  const handlePrevious = () => {
    console.log('[QUIZ] handlePrevious()', { currentQuestionIndex });
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      navigate('/');
    }
  };

  const isAnswered = () => {
    const answer = selectedAnswers[currentQuestion.id];
    if (currentQuestion.multiSelect) {
      return answer && answer.length > 0;
    }
    return answer !== undefined;
  };

  const getIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName];
    return IconComponent || LucideIcons.Circle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-8 w-auto"
            />
            <div className="text-stone-600 text-sm">Diagnóstico personalizado</div>
          </div>
          <div className="text-sm text-stone-600">
            Pregunta {currentQuestionIndex + 1} de {quizQuestions.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 px-6 py-4 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-stone-600 mt-2 text-center">
            {Math.round(progress)}% completado
          </div>
        </div>
      </div>

      {/* Question Content */}
      <main className="px-6 py-12 pt-32">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              {currentQuestion.title}
            </h1>
            <p className="text-lg text-stone-600">{currentQuestion.subtitle}</p>
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {currentQuestion.options.map((option) => {
              const IconComponent = getIconComponent(option.icon);
              const isSelected = currentQuestion.multiSelect
                ? (selectedAnswers[currentQuestion.id] || []).includes(option.id)
                : selectedAnswers[currentQuestion.id] === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id, currentQuestion.multiSelect)}
                  className={`
                    p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105
                    ${
                      isSelected
                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' : 'bg-stone-100 text-stone-600'}
                    `}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${isSelected ? 'text-amber-900' : 'text-stone-900'}`}>
                        {option.label}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-amber-700' : 'text-stone-600'}`}>{option.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation - Solo mostrar para multi-select */}
          {currentQuestion.multiSelect && (
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevious} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isAnswered()}
                className="bg-stone-900 hover:bg-stone-800 text-white flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Para preguntas no multi-select, botón Anterior si no es la primera */}
          {!currentQuestion.multiSelect && currentQuestionIndex > 0 && (
            <div className="flex justify-start">
              <Button variant="outline" onClick={handlePrevious} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;