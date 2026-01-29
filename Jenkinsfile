pipeline {
    agent any
    environment {
        AWS_REGION     = "us-east-1"
        ECS_CLUSTER    = "fuec-frontend-cluster"
        ECS_SERVICE    = "fuec-frontend-service"
        TASK_FAMILY    = "fuec-frontend"
        ECR_REPO_NAME  = "fuec/dev-fe"
        ECR_REGISTRY   = "660006306515.dkr.ecr.us-east-1.amazonaws.com"
        FULL_IMAGE     = "${ECR_REGISTRY}/${ECR_REPO_NAME}:latest"
    }
    stages {
        stage('Deploy to ECS') {
            steps {
                script {
                    echo "GitHub Actions build completed. Deploying version: latest"
                    sh '''
                        TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition ${TASK_FAMILY} --region ${AWS_REGION})
                        NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | jq --arg IMAGE "${FULL_IMAGE}" '.taskDefinition | .containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) |  del(.registeredAt)  | del(.registeredBy)')
                        NEW_TASK_INFO=$(aws ecs register-task-definition --region ${AWS_REGION} --cli-input-json "$NEW_TASK_DEFINITION")
                        NEW_REVISION=$(echo $NEW_TASK_INFO | jq '.taskDefinition.revision')
                        aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --task-definition ${TASK_FAMILY}:${NEW_REVISION} --force-new-deployment
                    '''
                }
            }
        }
    }
    post {
        success {
            echo "Deployment successful!"
        }
        failure {
            echo "Deployment failed!"
        }
    }
}
