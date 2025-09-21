@echo off
setlocal enabledelayedexpansion

:: Arquivo de saída
set OUTPUT=logos.js

:: Início do objeto
echo const logos = {> %OUTPUT%

set first=true

:: Loop pelos PNGs na pasta atual
for %%f in (*.png) do (
    if "!first!"=="true" (
        set first=false
        >> %OUTPUT% echo   "%%~nf": require('@/assets/images/logos/%%f'^)
    ) else (
        >> %OUTPUT% echo   ,"%%~nf": require('@/assets/images/logos/%%f'^)
    )
)

:: Fechar objeto e exportar
echo };>> %OUTPUT%
echo export default logos;>> %OUTPUT%

echo Arquivo %OUTPUT% gerado com sucesso!
pause