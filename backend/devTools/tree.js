const fs = require('fs');
const path = require('path');

// Configurações de exibição
const INDENT = '  ';
const MAX_DEPTH = 10; // Prevenção contra loops infinitos em links simbólicos

// Função para gerar a estrutura completa (pastas e arquivos)
function generateFullStructure(dir, depth = 0, prefix = '') {
    if (depth > MAX_DEPTH) return '';
    
    let structure = '';
    try {
        const files = fs.readdirSync(dir).filter(file => !file.startsWith('.') && file !== 'node_modules');
        
        files.forEach((file, index) => {
            const filePath = path.join(dir, file);
            const isLast = index === files.length - 1;
            const newPrefix = prefix + (isLast ? '└─ ' : '├─ ');
            
            try {
                const isDirectory = fs.statSync(filePath).isDirectory();
                
                structure += `${prefix}${isLast ? '└─' : '├─'} ${file}\n`;
                
                if (isDirectory) {
                    const childPrefix = prefix + (isLast ? '   ' : '│  ');
                    structure += generateFullStructure(filePath, depth + 1, childPrefix);
                }
            } catch (e) {
                structure += `${prefix}${isLast ? '└─' : '├─'} ${file} [error: ${e.message}]\n`;
            }
        });
    } catch (e) {
        structure = `${prefix}└─ [error reading directory: ${e.message}]\n`;
    }
    
    return structure;
}

// Função para gerar apenas a estrutura de pastas
function generateFolderStructure(dir, depth = 0, prefix = '') {
    if (depth > MAX_DEPTH) return '';
    
    let structure = '';
    try {
        const items = fs.readdirSync(dir)
            .filter(file => !file.startsWith('.'))
            .map(file => path.join(dir, file))
            .filter(filePath => fs.statSync(filePath).isDirectory())
            .map(filePath => path.basename(filePath));
        
        items.forEach((folder, index) => {
            const isLast = index === items.length - 1;
            const folderPath = path.join(dir, folder);
            
            structure += `${prefix}${isLast ? '└─' : '├─'} ${folder}\n`;
            
            const childPrefix = prefix + (isLast ? '   ' : '│  ');
            structure += generateFolderStructure(folderPath, depth + 1, childPrefix);
        });
    } catch (e) {
        structure = `${prefix}└─ [error reading directory: ${e.message}]\n`;
    }
    
    return structure;
}

// Função para listar diretórios não-recursivos dentro de uma pasta específica
function listDirectoriesInPages(baseDir) {
    const pagesPath = path.join(baseDir, 'pages');
    let result = '';
    
    try {
        if (!fs.existsSync(pagesPath)) {
            return `[A pasta 'pages' não foi encontrada em ${baseDir}]\n`;
        }

        const items = fs.readdirSync(pagesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        if (items.length === 0) {
            result = '[Nenhuma pasta encontrada dentro de pages]\n';
        } else {
            result = 'Páginas encontradas:\n';
            items.forEach(dir => {
                result += `├─ ${dir}\n`;
            });
            result = result.replace(/├─([^├└]*)$/, '└─$1'); // Substitui o último ├ por └
        }
    } catch (e) {
        result = `[Erro ao ler a pasta pages: ${e.message}]\n`;
    }
    
    return result;
}

// Função para salvar a estrutura em um arquivo com formatação
function saveStructureToFile(filename, title, content) {
    const header = `╔${'═'.repeat(title.length + 2)}╗\n║ ${title} ║\n╚${'═'.repeat(title.length + 2)}╝\n\n`;
    const footer = `\n${'─'.repeat(50)}\nGerado em: ${new Date().toLocaleString()}\n`;
    
    fs.writeFileSync(filename, header + content + footer);
    console.log(`Estrutura salva em: ${filename}`);
}

// Caminhos dos projetos
const backendDir = path.join(__dirname, '../src');
const frontendDir = path.join(__dirname, '../../frontend/src');

// Gerar estruturas
const output = {
    backendFull: generateFullStructure(backendDir),
    backendFolders: generateFolderStructure(backendDir),
    frontendFull: generateFullStructure(frontendDir),
    frontendFolders: generateFolderStructure(frontendDir),
    backendPages: listDirectoriesInPages(backendDir),
    frontendPages: listDirectoriesInPages(frontendDir),
};

// Exibir no console
// Exibir no console
console.log('\n=== ESTRUTURA COMPLETA DO BACKEND ===\n');
console.log(output.backendFull);

console.log('\n=== HIERARQUIA DE PASTAS DO BACKEND ===\n');
console.log(output.backendFolders);

console.log('\n=== PASTAS DENTRO DE PAGES (BACKEND) ===\n');
console.log(output.backendPages);

console.log('\n=== ESTRUTURA COMPLETA DO FRONTEND ===\n');
console.log(output.frontendFull);

console.log('\n=== HIERARQUIA DE PASTAS DO FRONTEND ===\n');
console.log(output.frontendFolders);

console.log('\n=== PASTAS DENTRO DE PAGES (FRONTEND) ===\n');
console.log(output.frontendPages);

// Salvar em arquivos (atualizado para incluir as páginas)
saveStructureToFile(
    path.join(__dirname, 'estrutura_completa_backend.txt'),
    'ESTRUTURA COMPLETA DO BACKEND',
    output.backendFull + '\n\n=== PASTAS DENTRO DE PAGES ===\n' + output.backendPages
);

saveStructureToFile(
    path.join(__dirname, 'hierarquia_pastas_backend.txt'),
    'HIERARQUIA DE PASTAS DO BACKEND',
    output.backendFolders + '\n\n=== PASTAS DENTRO DE PAGES ===\n' + output.backendPages
);

saveStructureToFile(
    path.join(__dirname, 'estrutura_completa_frontend.txt'),
    'ESTRUTURA COMPLETA DO FRONTEND',
    output.frontendFull + '\n\n=== PASTAS DENTRO DE PAGES ===\n' + output.frontendPages
);

saveStructureToFile(
    path.join(__dirname, 'hierarquia_pastas_frontend.txt'),
    'HIERARQUIA DE PASTAS DO FRONTEND',
    output.frontendFolders + '\n\n=== PASTAS DENTRO DE PAGES ===\n' + output.frontendPages
);

// Salvar em arquivos separados
saveStructureToFile(
    path.join(__dirname, 'estrutura_completa_backend.txt'),
    'ESTRUTURA COMPLETA DO BACKEND',
    output.backendFull
);

saveStructureToFile(
    path.join(__dirname, 'hierarquia_pastas_backend.txt'),
    'HIERARQUIA DE PASTAS DO BACKEND',
    output.backendFolders
);

saveStructureToFile(
    path.join(__dirname, 'estrutura_completa_frontend.txt'),
    'ESTRUTURA COMPLETA DO FRONTEND',
    output.frontendFull
);

saveStructureToFile(
    path.join(__dirname, 'hierarquia_pastas_frontend.txt'),
    'HIERARQUIA DE PASTAS DO FRONTEND',
    output.frontendFolders
);