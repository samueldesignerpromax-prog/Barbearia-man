const servicosData = require('../data/servicos.json');

// Banco de dados em memória (simulado)
let agendamentos = [];

module.exports = (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Listar agendamentos ou verificar horários
  if (req.method === 'GET') {
    const { email, data, horarios } = req.query;
    
    // Verificar horários disponíveis para uma data
    if (horarios === 'true' && data) {
      const agendamentosData = agendamentos.filter(a => a.data === data);
      const horariosOcupados = agendamentosData.map(a => a.horario);
      const horariosDisponiveis = servicosData.horarios.filter(h => !horariosOcupados.includes(h));
      
      return res.status(200).json({
        success: true,
        data: data,
        horarios: horariosDisponiveis
      });
    }
    
    // Buscar agendamentos por email
    if (email) {
      const agendamentosCliente = agendamentos.filter(a => a.email === email);
      return res.status(200).json({
        success: true,
        total: agendamentosCliente.length,
        agendamentos: agendamentosCliente.sort((a, b) => new Date(b.data) - new Date(a.data))
      });
    }
    
    // Listar todos (admin)
    return res.status(200).json({
      success: true,
      total: agendamentos.length,
      agendamentos: agendamentos.sort((a, b) => new Date(b.data) - new Date(a.data))
    });
  }
  
  // POST - Criar novo agendamento
  if (req.method === 'POST') {
    try {
      const { nome, email, telefone, servicoId, data, horario, observacoes } = req.body;
      
      // Validar dados
      if (!nome || !email || !telefone || !servicoId || !data || !horario) {
        return res.status(400).json({ 
          success: false, 
          error: 'Todos os campos são obrigatórios' 
        });
      }
      
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email inválido' 
        });
      }
      
      // Validar data (não pode ser no passado)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataAgendamento = new Date(data);
      if (dataAgendamento < hoje) {
        return res.status(400).json({ 
          success: false, 
          error: 'Não é possível agendar para datas passadas' 
        });
      }
      
      // Buscar serviço
      const servico = servicosData.servicos.find(s => s.id == servicoId);
      if (!servico) {
        return res.status(400).json({ 
          success: false, 
          error: 'Serviço não encontrado' 
        });
      }
      
      // Verificar horário disponível
      const horarioOcupado = agendamentos.some(a => a.data === data && a.horario === horario);
      if (horarioOcupado) {
        return res.status(400).json({ 
          success: false, 
          error: 'Horário indisponível. Escolha outro horário.' 
        });
      }
      
      // Criar agendamento
      const novoAgendamento = {
        id: Date.now().toString(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim(),
        servico: {
          id: servico.id,
          nome: servico.nome,
          preco: servico.preco
        },
        data: data,
        horario: horario,
        observacoes: observacoes || '',
        status: 'confirmado',
        createdAt: new Date().toISOString()
      };
      
      agendamentos.push(novoAgendamento);
      
      // Simular envio de email (console)
      console.log('=== NOVO AGENDAMENTO ===');
      console.log(`Cliente: ${novoAgendamento.nome}`);
      console.log(`Email: ${novoAgendamento.email}`);
      console.log(`Serviço: ${novoAgendamento.servico.nome}`);
      console.log(`Data: ${novoAgendamento.data} às ${novoAgendamento.horario}`);
      console.log('========================');
      
      return res.status(201).json({
        success: true,
        message: 'Agendamento realizado com sucesso!',
        agendamento: novoAgendamento
      });
      
    } catch (error) {
      console.error('Erro:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }
  
  // DELETE - Cancelar agendamento
  if (req.method === 'DELETE') {
    const { id, email } = req.query;
    
    const index = agendamentos.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Agendamento não encontrado' 
      });
    }
    
    // Verificar se o email corresponde (segurança básica)
    if (agendamentos[index].email !== email) {
      return res.status(403).json({ 
        success: false, 
        error: 'Você não tem permissão para cancelar este agendamento' 
      });
    }
    
    const cancelado = agendamentos[index];
    agendamentos.splice(index, 1);
    
    return res.status(200).json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      agendamento: cancelado
    });
  }
  
  return res.status(405).json({ error: 'Método não permitido' });
};
