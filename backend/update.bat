@echo off
echo 🔄 Updating Backend from Docker Hub...

:: 1. Остановить
docker-compose down

:: 2. Скачать
docker-compose pull

:: 3. Запустить
echo 🚀 Starting up...
docker-compose up --force-recreate

pause