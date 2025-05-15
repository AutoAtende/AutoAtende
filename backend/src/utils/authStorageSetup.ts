import fs from 'fs/promises';
import path from 'path';

export const setupAuthStorage = async () => {
  try {
    // 1. Criar diretório principal
    const authDir = path.join(process.cwd(), 'auth_storage');
    
    // Verificar se o diretório já existe
    try {
      await fs.access(authDir);
    } catch (error) {
      await fs.mkdir(authDir, { recursive: true });
      console.log('✅ Diretório auth_storage criado');
    }

    // 2. Criar/atualizar .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    
    try {
      const content = await fs.readFile(gitignorePath, 'utf-8');
      
      if (!content.includes('auth_storage/')) {
        await fs.appendFile(gitignorePath, '\n# Auth Storage\nauth_storage/\n');
        console.log('✅ Entrada adicionada ao .gitignore');
      }
    } catch (error) {
      // Criar novo .gitignore se não existir
      await fs.writeFile(gitignorePath, '# Auth Storage\nauth_storage/\n');
      console.log('✅ .gitignore criado com entrada para auth_storage');
    }

    // 3. Definir permissões (Unix apenas)
    if (process.platform !== 'win32') {
      try {
        await fs.chmod(authDir, 0o700);
        console.log('✅ Permissões definidas para 700');
      } catch (error) {
        console.error('⚠️ Erro ao definir permissões:', error);
      }
    }

  } catch (error) {
    console.error('❌ Erro crítico no setup:', error);
    process.exit(1);
  }
};

// Função para criar diretório de uma sessão específica
export const ensureSessionDir = async (whatsappId: number) => {
  const sessionDir = path.join('auth_storage', whatsappId.toString());
  
  try {
    await fs.mkdir(sessionDir, { recursive: true });
    
    if (process.platform !== 'win32') {
      await fs.chmod(sessionDir, 0o700);
    }
    
    return sessionDir;
  } catch (error) {
    console.error(`Erro ao criar diretório para sessão ${whatsappId}:`, error);
    throw error;
  }
};