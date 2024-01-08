FUNCTION_NAME=subdomain-to-s3-bucket-obj
for region in $(aws --output text  ec2 describe-regions --region us-east-1 | cut -f 4) 
do
    for loggroup in $(aws --output text logs describe-log-groups --log-group-name-pattern "/aws/lambda/us-east-1.$FUNCTION_NAME" --region $region --query 'logGroups[].logGroupName')
    do
        echo $region $loggroup
    done
done