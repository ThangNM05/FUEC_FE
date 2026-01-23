def COLOR_MAP = [
    'SUCCESS': 'good', 
    'FAILURE': 'danger', 
    'UNSTABLE': 'warning', 
    'ABORTED': 'gray'
]

pipeline {
    agent any
    environment {
        AWS_REGION     = "us-east-1"
        AWS_ACCOUNT_ID = "660006306515"
        ECR_REPO_NAME  = "fuec/dev-fe"
        ECS_CLUSTER    = "fuec-frontend-cluster"
        ECS_SERVICE    = "fuec-frontend-service"
        TASK_FAMILY    = "fuec-frontend"
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        FULL_IMAGE     = "${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG}"
    }
    stages {
        stage('Build') {
            steps {
                script {
                    sh """
                        docker build \
                        --build-arg VITE_API_URL=${env.VITE_API_URL} \
                        --build-arg VITE_CLERK_PUBLISHABLE_KEY=${env.VITE_CLERK_PUBLISHABLE_KEY} \
                        --build-arg VITE_GOOGLE_CLIENT_ID=${env.VITE_GOOGLE_CLIENT_ID} \
                        -t ${ECR_REPO_NAME}:${IMAGE_TAG} .
                    """
                }
            }
        }
        stage('Upload image to ECR') {
            steps {
                sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                sh "docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} ${FULL_IMAGE}"
                
                sh "docker push ${FULL_IMAGE}"
            }
        }
        
        stage('Update task definition and force deploy ecs service') {
            steps {
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
