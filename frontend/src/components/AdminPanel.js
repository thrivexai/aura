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
  AlertCircle
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

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !filters.search || 
      lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStage = filters.stage === 'all' || lead.stage === filters.stage;
    const matchesBusinessType = filters.businessType === 'all' || lead.businessType === filters.businessType;
    
    return matchesSearch && matchesStage && matchesBusinessType;
  });

  const exportLeads = () => {
    trackEvent('leads_export', {
      total_leads: filteredLeads.length,
      filters: filters
    });
    
    const csvContent = [
      ['Nombre', 'Email', 'WhatsApp', 'Tipo Negocio', 'Costo Principal', 'Objetivo', 'Etapa', 'Fecha Creación'],
      ...filteredLeads.map(lead => [
        lead.name,
        lead.email,
        lead.whatsapp || 'N/A',
        lead.businessType,
        lead.mainCost,
        lead.objective,
        getStageLabel(lead.stage),
        new Date(lead.createdAt).toLocaleDateString('es-ES')
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_aura_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver detalle
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredLeads.length === 0 && (
                    <div className="text-center py-8 text-stone-500">
                      No se encontraron leads con los filtros aplicados
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis detallado</CardTitle>
                  <CardDescription>
                    Métricas avanzadas y reportes del funnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-stone-500">
                    Dashboard de analytics en desarrollo...
                    <br />
                    <small>Próximamente: Gráficos de conversión, cohorts, A/B testing</small>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>
                    Ajustes del funnel y integraciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-stone-500">
                    Panel de configuración en desarrollo...
                    <br />
                    <small>Próximamente: Integraciones, webhooks, A/B tests</small>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;