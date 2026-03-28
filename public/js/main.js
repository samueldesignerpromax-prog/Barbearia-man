// API URL
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Carregar serviços na página inicial
async function loadServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    try {
        const response = await fetch('/data/servicos.json');
        const data = await response.json();
        
        servicesGrid.innerHTML = data.servicos.map(servico => `
            <div class="service-card">
                <div class="service-icon">${servico.icone}</div>
                <h3>${servico.nome}</h3>
                <div class="service-price">R$ ${servico.preco.toFixed(2)}</div>
                <p class="service-desc">${servico.descricao}</p>
                <p class="service-duration">⏱️ ${servico.duracao} minutos</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

// Carregar serviços no select do formulário
async function loadServicesSelect() {
    const servicoSelect = document.getElementById('servico');
    if (!servicoSelect) return;
    
    try {
        const response = await fetch('/data/servicos.json');
        const data = await response.json();
        
        servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>' +
            data.servicos.map(servico => `
                <option value="${servico.id}">${servico.nome} - R$ ${servico.preco.toFixed(2)}</option>
            `).join('');
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

// Carregar horários disponíveis
async function loadHorarios(data) {
    const horarioSelect = document.getElementById('horario');
    if (!horarioSelect || !data) return;
    
    try {
        const response = await fetch(`${API_URL}/agendamentos?horarios=true&data=${data}`);
        const result = await response.json();
        
        horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
        
        if (result.horarios && result.horarios.length > 0) {
            result.horarios.forEach(horario => {
                horarioSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
            });
        } else {
            horarioSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
        }
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
    }
}

// Agendar horário
async function agendarHorario(event) {
    event.preventDefault();
    
    const dados = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        servicoId: parseInt(document.getElementById('servico').value),
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value,
        observacoes: document.getElementById('observacoes')?.value || ''
    };
    
    try {
        const response = await fetch(`${API_URL}/agendamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('✅ Agendamento realizado com sucesso! Você receberá um email de confirmação.', 'success');
            document.getElementById('bookingForm').reset();
            document.getElementById('horario').innerHTML = '<option value="">Selecione um horário</option>';
        } else {
            showMessage(result.error || 'Erro ao realizar agendamento', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro de conexão com o servidor', 'error');
    }
}

// Buscar agendamentos por email
async function buscarAgendamentos(email) {
    const appointmentsList = document.getElementById('appointmentsList');
    if (!appointmentsList) return;
    
    if (!email) {
        appointmentsList.innerHTML = '<div class="empty-state">Digite seu e-mail para consultar</div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/agendamentos?email=${encodeURIComponent(email)}`);
        const result = await response.json();
        
        if (result.agendamentos && result.agendamentos.length > 0) {
            appointmentsList.innerHTML = result.agendamentos.map(agendamento => `
                <div class="appointment-card">
                    <div class="appointment-info">
                        <h3>${agendamento.servico.nome}</h3>
                        <p>📅 ${formatarData(agendamento.data)} às ${agendamento.horario}</p>
                        <p>💰 R$ ${agendamento.servico.preco.toFixed(2)}</p>
                        <p>📞 ${agendamento.telefone}</p>
                        <span class="appointment-status">${agendamento.status === 'confirmado' ? '✓ Confirmado' : '⏳ Pendente'}</span>
                    </div>
                    <button class="btn-cancel" onclick="cancelarAgendamento('${agendamento.id}', '${email}')">
                        Cancelar
                    </button>
                </div>
            `).join('');
        } else {
            appointmentsList.innerHTML = '<div class="empty-state">Nenhum agendamento encontrado para este e-mail</div>';
        }
    } catch (error) {
        console.error('Erro:', error);
        appointmentsList.innerHTML = '<div class="empty-state">Erro ao carregar agendamentos</div>';
    }
}

// Cancelar agendamento
async function cancelarAgendamento(id, email) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    try {
        const response = await fetch(`${API_URL}/agendamentos?id=${id}&email=${encodeURIComponent(email)}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('✅ Agendamento cancelado com sucesso!', 'success');
            buscarAgendamentos(email);
        } else {
            showMessage(result.error || 'Erro ao cancelar agendamento', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao cancelar agendamento', 'error');
    }
}

// Enviar mensagem de contato
async function enviarContato(event) {
    event.preventDefault();
    
    const dados = {
        nome: document.getElementById('contactName')?.value,
        email: document.getElementById('contactEmail')?.value,
        telefone: document.getElementById('contactPhone')?.value,
        mensagem: document.getElementById('contactMessage')?.value
    };
    
    try {
        const response = await fetch(`${API_URL}/contato`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('✅ Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            document.getElementById('contactForm')?.reset();
        } else {
            showMessage(result.error || 'Erro ao enviar mensagem', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao enviar mensagem', 'error');
    }
}

// Mostrar mensagem
function showMessage(message, type) {
    const messageDiv = document.getElementById('messageResult');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className
