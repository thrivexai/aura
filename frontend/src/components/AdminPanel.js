import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Download,
  Search,
  Filter,
  BarChart3,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { quizQuestions, trackEvent } from '../mock';

const AdminPanel = () => {
  const [leads, setLeads] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [metrics, setMetrics] = useState({
    totalVisitors: 0,
    leadsGenerated: 0,
    purchases: 0,
    conversionRate: 0,
    quizStarts: 0,
    quizCompletions: 0,
    diagnosisViewed: 0,
    checkoutClicks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    stage: 'all',
    businessType: 'all',
    dateRange: '7d'
  });
  const [webhookUrls, setWebhookUrls] = useState({
    leadCapture: '/api/webhooks/lead-capture',
    purchase: '/api/webhooks/purchase'
  });
  const [editingWebhooks, setEditingWebhooks] = useState(false);
  const [tempWebhookUrls, setTempWebhookUrls] = useState({ ...webhookUrls });

  const [leadDetails, setLeadDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const viewLeadDetails = (lead) => {
    setLeadDetails(lead);
    setShowModal(true);
    trackEvent('admin_view_lead_details', {
      lead_id: lead.id,
      lead_stage: lead.stage
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch leads
      const leadsResponse = await fetch(`${backendUrl}/api/leads`);
      const leadsData = await leadsResponse.json();
      
      // Fetch purchases  
      const purchasesResponse = await fetch(`${backendUrl}/api/purchases`);
      const purchasesData = await purchasesResponse.json();
      
      // Fetch metrics
      const metricsResponse = await fetch(`${backendUrl}/api/metrics`);
      const metricsData = await metricsResponse.json();

      if (leadsData.error || purchasesData.error || metricsData.error) {
        throw new Error(leadsData.error || purchasesData.error || metricsData.error);
      }

      setLeads(leadsData.leads || []);
      setPurchases(purchasesData.purchases || []);
      setMetrics(metricsData);
      
      console.log('Data loaded successfully:', {
        leads: leadsData.leads?.length || 0,
        purchases: purchasesData.purchases?.length || 0,
        metrics: metricsData
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    trackEvent('admin_panel_view', {
      admin_user: 'admin',
      section: 'dashboard'
    });
  }, []);

  // Combinar leads y purchases para la vista unificada
  const allLeads = [...leads, ...purchases].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const getStageLabel = (stage) => {
    const stageLabels = {
      'quiz_step_1': 'Quiz Paso 1',
      'quiz_step_2': 'Quiz Paso 2', 
      'quiz_step_3': 'Quiz Paso 3',
      'quiz_step_4': 'Quiz Paso 4',
      'quiz_step_5': 'Quiz Paso 5',
      'lead_capture': 'Captura de Lead',
      'diagnosis': 'Diagnóstico',
      'checkout': 'Checkout',
      'purchased': 'Comprado'
    };
    return stageLabels[stage] || stage;
  };

  const getStageVariant = (stage) => {
    const variants = {
      'quiz_step_1': 'secondary',
      'quiz_step_2': 'secondary',
      'quiz_step_3': 'secondary', 
      'quiz_step_4': 'secondary',
      'quiz_step_5': 'secondary',
      'lead_capture': 'outline',
      'diagnosis': 'default',
      'checkout': 'destructive',
      'purchased': 'default'
    };
    return variants[stage] || 'outline';
  };

  const filteredLeads = allLeads.filter(lead => {
    const matchesSearch = !filters.search || 
      lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStage = filters.stage === 'all' || lead.stage === filters.stage;
    const matchesBusinessType = filters.businessType === 'all' || lead.businessType === filters.businessType;
    
    return matchesSearch && matchesStage && matchesBusinessType;
  });

  const exportLeads = async () => {
    trackEvent('leads_export', {
      total_leads: filteredLeads.length,
      filters: filters
    });
    
    try {
      const response = await fetch(`${backendUrl}/api/export-leads-csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_completo_aura_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Error downloading CSV:', response.statusText);
      }
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_funnel-ai-fashion/artifacts/agvhelw9_AURA%20LOGO%20BLACK.png"
              alt="AURA"
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-stone-900">Panel de Administración</h1>
              <p className="text-sm text-stone-600">Funnel Moda Rentable con IA</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Cargando...' : 'Actualizar'}
            </Button>
            <Button onClick={exportLeads} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <div className="text-sm text-stone-600">
              Último update: {new Date().toLocaleTimeString('es-ES')}
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>Error cargando datos: {error}</span>
              <Button onClick={fetchData} variant="outline" size="sm" className="ml-auto">
                Reintentar
              </Button>
            </div>
          )}
          
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Visitantes totales</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalVisitors.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% vs mes anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leads generados</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.leadsGenerated}</div>
                    <p className="text-xs text-muted-foreground">
                      Tasa conversión: {((metrics.leadsGenerated / metrics.totalVisitors) * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventas</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.purchases}</div>
                    <p className="text-xs text-muted-foreground">
                      ${(metrics.purchases * 15).toLocaleString()} USD facturados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversión</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Objetivo: 8%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Embudo de conversión */}
              <Card>
                <CardHeader>
                  <CardTitle>Embudo de conversión</CardTitle>
                  <CardDescription>
                    Análisis del drop-off por etapa del funnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Visitantes', value: metrics.totalVisitors, percentage: 100 },
                      { label: 'Iniciaron Quiz', value: metrics.quizStarts, percentage: (metrics.quizStarts / metrics.totalVisitors) * 100 },
                      { label: 'Completaron Quiz', value: metrics.quizCompletions, percentage: (metrics.quizCompletions / metrics.totalVisitors) * 100 },
                      { label: 'Se convirtieron en Lead', value: metrics.leadsGenerated, percentage: (metrics.leadsGenerated / metrics.totalVisitors) * 100 },
                      { label: 'Vieron Diagnóstico', value: metrics.diagnosisViewed, percentage: (metrics.diagnosisViewed / metrics.totalVisitors) * 100 },
                      { label: 'Fueron a Checkout', value: metrics.checkoutClicks, percentage: (metrics.checkoutClicks / metrics.totalVisitors) * 100 },
                      { label: 'Compraron', value: metrics.purchases, percentage: (metrics.purchases / metrics.totalVisitors) * 100 }
                    ].map((stage, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-32 text-sm font-medium">{stage.label}</div>
                        <div className="flex-1 bg-stone-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stage.percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-sm font-bold">{stage.value}</div>
                        <div className="w-16 text-sm text-stone-600">{stage.percentage.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads" className="space-y-6">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o email..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-8"
                      />
                    </div>
                    
                    <Select 
                      value={filters.stage} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las etapas</SelectItem>
                        <SelectItem value="quiz_step_3">Quiz Paso 3</SelectItem>
                        <SelectItem value="diagnosis">Diagnóstico</SelectItem>
                        <SelectItem value="checkout">Checkout</SelectItem>
                        <SelectItem value="purchased">Comprado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.businessType} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, businessType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de negocio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="diseñador-independiente">Diseñador independiente</SelectItem>
                        <SelectItem value="marca-emergente">Marca emergente</SelectItem>
                        <SelectItem value="marca-establecida">Marca establecida</SelectItem>
                        <SelectItem value="tienda-multimarca">Tienda multimarca</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.dateRange} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">Último día</SelectItem>
                        <SelectItem value="7d">Últimos 7 días</SelectItem>
                        <SelectItem value="30d">Últimos 30 días</SelectItem>
                        <SelectItem value="90d">Últimos 90 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de leads */}
              <Card>
                <CardHeader>
                  <CardTitle>Leads ({filteredLeads.length})</CardTitle>
                  <CardDescription>
                    Gestión de todos los leads generados por el funnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredLeads.map((lead) => (
                      <div key={lead.id} className="p-4 border border-stone-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-stone-900">{lead.name}</h3>
                              <Badge variant={getStageVariant(lead.stage)}>
                                {getStageLabel(lead.stage)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-stone-600">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>{lead.email}</span>
                              </div>
                              {lead.whatsapp && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{lead.whatsapp}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(lead.createdAt).toLocaleDateString('es-ES')}</span>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="font-medium">Negocio:</span> {lead.businessType}
                              </div>
                              <div>
                                <span className="font-medium">Costo principal:</span> {lead.mainCost}
                              </div>
                              <div>
                                <span className="font-medium">Objetivo:</span> {lead.objective}
                              </div>
                              <div>
                                <span className="font-medium">Usa IA:</span> {lead.aiUsage}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewLeadDetails(lead)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver detalle
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredLeads.length === 0 && !loading && (
                    <div className="text-center py-8 text-stone-500">
                      {allLeads.length === 0 ? (
                        <div>
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-stone-400" />
                          <p>No hay datos disponibles</p>
                          <p className="text-sm">Los leads aparecerán aquí cuando los usuarios completen el formulario</p>
                        </div>
                      ) : (
                        "No se encontraron leads con los filtros aplicados"
                      )}
                    </div>
                  )}
                  
                  {loading && (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin text-stone-400 mb-4" />
                      <p className="text-stone-500">Cargando datos...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribución por tipo de negocio */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Tipo de Negocio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const businessTypes = {};
                      allLeads.forEach(lead => {
                        const type = lead.businessType || 'sin-especificar';
                        businessTypes[type] = (businessTypes[type] || 0) + 1;
                      });
                      
                      return (
                        <div className="space-y-3">
                          {Object.entries(businessTypes).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-stone-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                                    style={{ width: `${(count / allLeads.length) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Distribución por costos principales */}
                <Card>
                  <CardHeader>
                    <CardTitle>Principales Costos Reportados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const costs = {};
                      allLeads.forEach(lead => {
                        const cost = lead.mainCost || 'sin-especificar';
                        costs[cost] = (costs[cost] || 0) + 1;
                      });
                      
                      return (
                        <div className="space-y-3">
                          {Object.entries(costs).map(([cost, count]) => (
                            <div key={cost} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{cost.replace('-', ' ')}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-stone-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                    style={{ width: `${(count / allLeads.length) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Objetivos más comunes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Objetivos Principales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const objectives = {};
                      allLeads.forEach(lead => {
                        const obj = lead.objective || 'sin-especificar';
                        objectives[obj] = (objectives[obj] || 0) + 1;
                      });
                      
                      return (
                        <div className="space-y-3">
                          {Object.entries(objectives).map(([obj, count]) => (
                            <div key={obj} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{obj.replace('-', ' ')}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-stone-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full"
                                    style={{ width: `${(count / allLeads.length) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Uso de IA */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nivel de Uso de IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const aiUsage = {};
                      allLeads.forEach(lead => {
                        const usage = lead.aiUsage || 'sin-especificar';
                        aiUsage[usage] = (aiUsage[usage] || 0) + 1;
                      });
                      
                      return (
                        <div className="space-y-3">
                          {Object.entries(aiUsage).map(([usage, count]) => (
                            <div key={usage} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{usage.replace('-', ' ')}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-stone-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                    style={{ width: `${(count / allLeads.length) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de conversión por etapa */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Conversión por Etapa</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const stages = {
                      'lead_capture': 'Captura de Lead',
                      'diagnosis': 'Diagnóstico', 
                      'checkout': 'Checkout',
                      'purchased': 'Comprado'
                    };
                    
                    const stageData = Object.entries(stages).map(([stage, label]) => {
                      const count = allLeads.filter(lead => lead.stage === stage).length;
                      const percentage = allLeads.length > 0 ? (count / allLeads.length) * 100 : 0;
                      return { stage, label, count, percentage };
                    });
                    
                    return (
                      <div className="space-y-4">
                        {stageData.map(({ stage, label, count, percentage }) => (
                          <div key={stage} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant={getStageVariant(stage)}>{label}</Badge>
                              <span className="text-sm text-stone-600">{count} leads</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-stone-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-12">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuración de Webhooks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Webhooks</CardTitle>
                    <CardDescription>URLs de destino para eventos del funnel</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Webhook Lead Capture</label>
                      <Input 
                        value="/api/webhooks/lead-capture" 
                        disabled 
                        className="mt-1 font-mono text-xs"
                      />
                      <p className="text-xs text-stone-500 mt-1">Se ejecuta cuando un usuario completa el formulario de lead</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Webhook Purchase</label>
                      <Input 
                        value="/api/webhooks/purchase" 
                        disabled 
                        className="mt-1 font-mono text-xs"
                      />
                      <p className="text-xs text-stone-500 mt-1">Se ejecuta cuando se completa una compra</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Configuración de Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle>Parámetros de Tracking</CardTitle>
                    <CardDescription>Datos capturados en cada webhook</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>Lead Capture incluye:</strong>
                        <ul className="list-disc list-inside text-xs text-stone-600 mt-1 space-y-1">
                          <li>Nombre, Email, WhatsApp</li>
                          <li>Respuestas del quiz</li>
                          <li>IP del usuario</li>
                          <li>User Agent</li>
                          <li>Parámetros UTM (source, medium, campaign)</li>
                          <li>Facebook tracking (_fbc, _fbp, fbclid)</li>
                          <li>Session ID único</li>
                        </ul>
                      </div>
                      <div className="text-sm">
                        <strong>Purchase incluye:</strong>
                        <ul className="list-disc list-inside text-xs text-stone-600 mt-1 space-y-1">
                          <li>Todos los datos del lead capture</li>
                          <li>Transaction ID</li>
                          <li>Valor de la compra ($15 USD)</li>
                          <li>Timestamp de la transacción</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estado de la Base de Datos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de la Base de Datos</CardTitle>
                    <CardDescription>Información sobre las colecciones de MongoDB</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{leads.length}</div>
                        <div className="text-sm text-blue-700">Lead Webhooks</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{purchases.length}</div>
                        <div className="text-sm text-green-700">Purchase Webhooks</div>
                      </div>
                    </div>
                    <div className="text-xs text-stone-500">
                      <p>Colecciones: lead_webhooks, purchase_webhooks</p>
                      <p>Última actualización: {new Date().toLocaleString('es-ES')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Exportación de Datos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Exportación de Datos</CardTitle>
                    <CardDescription>Descargar datos para análisis externo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button 
                        onClick={exportLeads} 
                        variant="outline" 
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Todos los Leads Completo (CSV)
                      </Button>
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch(`${backendUrl}/api/export-purchases-csv`);
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `compras_completo_aura_${new Date().toISOString().split('T')[0]}.csv`;
                              a.click();
                              window.URL.revokeObjectURL(url);
                            } else {
                              console.error('Error downloading purchases CSV:', response.statusText);
                            }
                          } catch (error) {
                            console.error('Error exporting purchases:', error);
                          }
                        }} 
                        variant="outline" 
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Compras Completo (CSV)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal para ver detalles del lead */}
        {showModal && leadDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto m-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-900">Detalles del Lead</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-600">Nombre</label>
                      <p className="text-stone-900">{leadDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-600">Email</label>
                      <p className="text-stone-900">{leadDetails.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-600">WhatsApp</label>
                      <p className="text-stone-900">{leadDetails.whatsapp || 'No proporcionado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-600">Etapa</label>
                      <Badge variant={getStageVariant(leadDetails.stage)}>
                        {getStageLabel(leadDetails.stage)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-600">Tipo de Negocio</label>
                      <p className="text-stone-900">{leadDetails.businessType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-600">Principal Costo</label>
                      <p className="text-stone-900">{leadDetails.mainCost}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-600">Objetivo</label>
                      <p className="text-stone-900">{leadDetails.objective}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-600">Uso de IA</label>
                      <p className="text-stone-900">{leadDetails.aiUsage}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-600">Fecha de Creación</label>
                      <p className="text-stone-900">{new Date(leadDetails.createdAt).toLocaleString('es-ES')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-600">IP</label>
                      <p className="text-stone-900">{leadDetails.ip || 'No disponible'}</p>
                    </div>
                  </div>

                  {leadDetails.stage === 'purchased' && leadDetails.transactionId && (
                    <div>
                      <label className="text-sm font-medium text-stone-600">ID de Transacción</label>
                      <p className="text-stone-900 font-mono">{leadDetails.transactionId}</p>
                    </div>
                  )}

                  {leadDetails.utmSource && (
                    <div>
                      <label className="text-sm font-medium text-stone-600">Parámetros UTM</label>
                      <div className="text-sm text-stone-700">
                        {leadDetails.utmSource && <p>Source: {leadDetails.utmSource}</p>}
                        {leadDetails.utmMedium && <p>Medium: {leadDetails.utmMedium}</p>}
                        {leadDetails.utmCampaign && <p>Campaign: {leadDetails.utmCampaign}</p>}
                      </div>
                    </div>
                  )}

                  {leadDetails.userAgent && (
                    <div>
                      <label className="text-sm font-medium text-stone-600">User Agent</label>
                      <p className="text-xs text-stone-600 break-all">{leadDetails.userAgent}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;