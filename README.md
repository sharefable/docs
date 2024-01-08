

### Connect to ECR private registry
```bash
# install aws cli if it's not installed
apt install awscli

docker login -u AWS -p $(aws ecr get-login-password --region ap-southeast-1) 556055615522.dkr.ecr.ap-southeast-1.amazonaws.com
```

### Run github bot

Copy `./run.sh` to remote host and run it directly.

```bash
scp run.sh ubuntu@<server_from_ssh_config>:/home/ubuntu

## run the script with desired version of the image in ecr
./run.sh 1.1.2
```