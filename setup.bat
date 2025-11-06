@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   🏢 SFERA TI - Instalação Automática
echo ========================================
echo.

REM Verificar se Docker está instalado
echo [1/6] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não encontrado!
    echo.
    echo Por favor, instale o Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo ✓ Docker instalado!
echo.

REM Verificar se Docker está rodando
echo [2/6] Verificando se Docker está rodando...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Desktop não está rodando!
    echo.
    echo Por favor, inicie o Docker Desktop e tente novamente.
    echo.
    pause
    exit /b 1
)
echo ✓ Docker rodando!
echo.

REM Verificar se as pastas existem
echo [3/6] Verificando estrutura de arquivos...
if not exist "docker-compose.yml" (
    echo ❌ Arquivo docker-compose.yml não encontrado!
    echo.
    echo Certifique-se de estar na pasta correta com todos os arquivos.
    echo.
    pause
    exit /b 1
)
echo ✓ Arquivos encontrados!
echo.

REM Parar containers antigos
echo [4/6] Parando containers antigos (se existirem)...
docker-compose down >nul 2>&1
echo ✓ Containers antigos parados!
echo.

REM Limpar volumes antigos (opcional)
echo [5/6] Deseja limpar dados antigos? (S/N)
set /p LIMPAR="Isso vai APAGAR todos os dados anteriores: "
if /i "%LIMPAR%"=="S" (
    echo.
    echo Limpando volumes...
    docker-compose down -v >nul 2>&1
    echo ✓ Dados antigos removidos!
) else (
    echo ✓ Mantendo dados existentes!
)
echo.

REM Iniciar sistema
echo [6/6] Iniciando sistema SFERA TI...
echo.
echo ⏳ Isso pode demorar 5-10 minutos na primeira vez...
echo    - Baixando imagens Docker
echo    - Instalando dependências
echo    - Criando banco de dados
echo    - Construindo aplicação
echo.
echo Aguarde...
echo.

docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ❌ Erro ao iniciar o sistema!
    echo.
    echo Tente executar manualmente:
    echo docker-compose up --build
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ Sistema SFERA TI Iniciado!
echo ========================================
echo.
echo Aguarde alguns segundos para os serviços iniciarem...
timeout /t 10 /nobreak >nul

echo.
echo 📊 Verificando status dos containers...
echo.
docker-compose ps
echo.

echo ========================================
echo   🌐 ACESSO AO SISTEMA
echo ========================================
echo.
echo Sistema Completo:
echo   http://localhost
echo.
echo Frontend Direto:
echo   http://localhost:3001
echo.
echo API Backend:
echo   http://localhost:3000/api
echo.
echo Health Check:
echo   http://localhost:3000/api/health
echo.
echo ========================================
echo   🔐 LOGIN PADRÃO
echo ========================================
echo.
echo Email: admin@sfera.com.br
echo Senha: admin123
echo.
echo ⚠️  IMPORTANTE: Altere a senha após primeiro login!
echo.
echo ========================================
echo   📚 COMANDOS ÚTEIS
echo ========================================
echo.
echo Ver logs em tempo real:
echo   docker-compose logs -f
echo.
echo Parar o sistema:
echo   docker-compose down
echo.
echo Reiniciar o sistema:
echo   docker-compose restart
echo.
echo Ver status:
echo   docker-compose ps
echo.
echo ========================================
echo.
echo ✨ Sistema pronto para uso!
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

REM Abrir navegador
start http://localhost

echo.
echo Navegador aberto! Aguarde o sistema carregar.
echo.
echo Pressione qualquer tecla para sair...
pause >nul

exit /b 0