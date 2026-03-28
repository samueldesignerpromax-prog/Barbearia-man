module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { nome, email, telefone, mensagem } = req.body;
      
      if (!nome || !email || !mensagem) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nome, email e mensagem são obrigatórios' 
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
      
      // Simular envio de email
      console.log('=== MENSAGEM DE CONTATO ===');
      console.log(`Nome: ${nome}`);
      console.log(`Email: ${email}`);
      console.log(`Telefone: ${telefone || 'Não informado'}`);
      console.log(`Mensagem: ${mensagem}`);
      console.log('===========================');
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
      });
      
    } catch (error) {
      console.error('Erro:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao enviar mensagem' 
      });
    }
  }
  
  return res.status(405).json({ error: 'Método não permitido' });
};
