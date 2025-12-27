#!/usr/bin/env python3
"""
EECAR Architecture Diagram Generator
Uses Python diagrams package to create AWS architecture visualization
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb
from diagrams.aws.storage import S3
from diagrams.aws.network import APIGateway, CloudFront
from diagrams.aws.integration import SNS
from diagrams.aws.ml import Sagemaker
from diagrams.aws.management import Cloudwatch
from diagrams.aws.general import Client
from diagrams.saas.chat import Slack
from diagrams.programming.framework import React
from diagrams.onprem.vcs import Github

# Graph attributes for better layout
graph_attr = {
    "fontsize": "20",
    "bgcolor": "white",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.0",
}

with Diagram(
    "EECAR - B2B EV Parts Trading Platform",
    filename="/home/dyseo521/eecar/docs/architecture",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
):
    # Users
    buyer = Client("Buyer")
    seller = Client("Seller")

    # Frontend
    with Cluster("Frontend"):
        cloudfront = CloudFront("CloudFront CDN")
        frontend_s3 = S3("S3 Static Hosting")
        react = React("React 18\nTanStack Query")

    # API Layer
    api_gw = APIGateway("API Gateway\n(REST)")

    # Lambda Functions
    with Cluster("Lambda Functions (11)"):
        with Cluster("Core APIs"):
            vector_search = Lambda("VectorSearch\n(RAG)")
            part_reg = Lambda("PartRegistration")
            get_parts = Lambda("GetParts")

        with Cluster("Business Logic"):
            proposal = Lambda("Proposal")
            watch = Lambda("WatchPart")
            contact = Lambda("ContactInquiry")

        with Cluster("Specialized Search"):
            battery = Lambda("BatteryHealth")
            material = Lambda("MaterialProperty")

        with Cluster("Operations"):
            compliance = Lambda("ComplianceCheck")
            synthetic = Lambda("SyntheticData")
            slack_notify = Lambda("SlackNotify")

    # AI/ML
    with Cluster("AI/ML (Bedrock)"):
        titan = Sagemaker("Titan Embeddings\n(Vector)")
        claude = Sagemaker("Claude Haiku\n(Reasoning)")

    # Storage
    with Cluster("Storage"):
        dynamodb = Dynamodb("DynamoDB\nSingle-Table\n+ 2 GSI")
        vectors_bucket = S3("S3 Vectors\n(Embeddings)")
        docs_bucket = S3("S3 Documents\n(Compliance)")
        s3_vectors = S3("S3 Vectors Index\n(HNSW)")

    # Integration
    sns = SNS("SNS\nNotifications")

    # Monitoring
    with Cluster("Monitoring"):
        cloudwatch = Cloudwatch("CloudWatch\nDashboard + X-Ray")
        slack = Slack("Slack\nAlerts")

    # CI/CD
    github = Github("GitHub Actions\nCI/CD")

    # Connections - User Flow
    buyer >> cloudfront >> frontend_s3
    seller >> cloudfront
    frontend_s3 - react
    react >> api_gw

    # API to Lambda
    api_gw >> vector_search
    api_gw >> part_reg
    api_gw >> get_parts
    api_gw >> proposal
    api_gw >> watch
    api_gw >> battery
    api_gw >> material
    api_gw >> contact

    # Lambda to AI
    vector_search >> titan
    vector_search >> claude
    part_reg >> titan
    compliance >> claude

    # Lambda to Storage
    vector_search >> dynamodb
    vector_search >> s3_vectors
    part_reg >> dynamodb
    part_reg >> vectors_bucket
    get_parts >> dynamodb
    proposal >> dynamodb
    watch >> dynamodb
    battery >> dynamodb
    material >> dynamodb

    # Compliance flow
    part_reg >> compliance
    compliance >> docs_bucket
    compliance >> sns

    # Notifications
    watch >> sns
    proposal >> sns
    contact >> sns

    # Monitoring
    cloudwatch >> slack_notify >> slack

    # CI/CD
    github >> frontend_s3

print("✅ Architecture diagram generated: docs/architecture.png")
