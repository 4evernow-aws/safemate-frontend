@echo off
echo Deploying Hedera Lambda function fix...
echo.

echo Step 1: Creating deployment package...
powershell -Command "Compress-Archive -Path 'services\hedera-service\index.js','services\hedera-service\hedera-client.js' -DestinationPath 'services\hedera-service\hedera-service.zip' -Force"

echo Step 2: Planning Terraform changes...
terraform plan -target=aws_lambda_function.hedera_service

echo Step 3: Apply changes...
terraform apply -target=aws_lambda_function.hedera_service -auto-approve

echo Done!
