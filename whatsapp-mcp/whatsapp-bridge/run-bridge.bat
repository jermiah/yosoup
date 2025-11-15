@echo off
echo Starting WhatsApp Bridge on port 8082...
set PATH=%PATH%;C:\TDM-GCC-64\bin
go run main.go
pause
