@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🔄 Reiniciando Backend SFERA TI
echo ========================================
echo.

echo Parando backend...
docker-compose stop backend

echo.
echo Removendo container antigo...
docker-compose rm -f backend

echo.
echo Reconstruindo e iniciando backend...
docker-compose up -d --build backend

echo.
echo ✅ Backend reiniciado!
echo.
echo Ver logs:
echo   docker-compose logs -f backend
echo.
pause