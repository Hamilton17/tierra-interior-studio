@echo off
echo.
echo  ================================================
echo   Tierra Interior Studio - Servidor Local
echo   http://localhost:8080/app/
echo  ================================================
echo.
cd /d "%~dp0"
npx http-server -p 8080 --cors -c-1
