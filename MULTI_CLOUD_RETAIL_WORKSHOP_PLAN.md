# Multi-Cloud AI Retail Workshop Plan

## Goal

Build an AI-powered retail website that can:

- browse products
- recommend items to customers
- simulate checkout
- process orders
- support employee tasks

The project will have two parallel cloud tracks:

- AWS track
- Azure track

Both tracks should solve the same business problem with similar scope so students can compare the platforms.

## Workshop Format

- Lecture: 1 hour
- Build time: 1 to 2 hours

This means the project must be a guided MVP, not a full e-commerce system.

## Core Project Theme

Students build a customizable big-box retail simulator.

Each team can customize:

- store name
- store theme
- store location
- shipping regions
- product categories
- inventory data
- employee role focus

Examples:

- home goods store
- electronics retailer
- outdoor supply chain
- grocery-style store
- student campus convenience store

## MVP Scope

### Customer Features

- browse and search products
- get AI product recommendations
- add items to cart
- run mock checkout
- create an order record

### Employee Features

- view incoming orders
- update order status
- view low-stock or restock tasks
- use AI assistant for simple operational help

### AI Features

- product recommendation assistant
- natural-language product search
- order help and FAQ support
- employee support assistant

## Features To Exclude From The Base Workshop

- real payments
- real shipping carrier integrations
- persistent production auth
- real customer accounts
- advanced training pipelines during class

## Shared Product Rules

- payment is mock-only
- use a payment reference or token, not card numbers
- auth is temporary and session-based
- order processing is simulated
- schema stays fixed even if the store theme changes

## Cloud Scope

The application should feel equivalent on both clouds.

### AWS Track

Use these 5 services:

1. Amazon EC2
2. Amazon S3
3. Amazon DynamoDB
4. Amazon Bedrock
5. Amazon SQS

Service roles:

- `EC2`: host backend and optionally frontend
- `S3`: product images, seed datasets, generated assets
- `DynamoDB`: carts, orders, inventory, employee task state
- `Bedrock`: customer and employee AI assistants
- `SQS`: simulate order processing workflow

### Azure Track

Use these 5 services:

1. Azure App Service or Azure Container Apps
2. Azure Blob Storage
3. Azure Cosmos DB
4. Azure OpenAI
5. Azure Queue Storage or Azure Service Bus

Service roles:

- `App Service` or `Container Apps`: host backend and optionally frontend
- `Blob Storage`: product images, seed datasets, generated assets
- `Cosmos DB`: carts, orders, inventory, employee task state
- `Azure OpenAI`: customer and employee AI assistants
- `Queue Storage` or `Service Bus`: simulate order processing workflow

## Architecture Pattern

Both cloud tracks should follow the same flow:

1. frontend sends request to backend
2. backend loads product or order data
3. backend calls AI service when assistant logic is needed
4. checkout creates order record
5. backend pushes order event to queue
6. employee dashboard reads updated order state

## Recommended Data Model

Keep the schema simple and fixed.

### Products

- `product_id`
- `name`
- `category`
- `description`
- `price`
- `inventory_count`
- `store_region`
- `shipping_regions`
- `image_url`
- `tags`

### Orders

- `order_id`
- `team_id`
- `workshop_id`
- `customer_name`
- `items`
- `total`
- `payment_ref`
- `shipping_region`
- `status`
- `created_at`

### Employee Tasks

- `task_id`
- `task_type`
- `product_id`
- `priority`
- `status`
- `assigned_role`

## Student Deliverables

Each team should finish:

- branded storefront
- working product catalog
- mock checkout flow
- saved order record
- one AI assistant flow
- one employee workflow

## What You Should Pre-Build

To keep the workshop realistic, provide:

- frontend shell with pages already created
- backend API skeleton with routes stubbed
- starter datasets
- sample images
- environment templates
- one shared instructor deployment if needed
- helper functions for data storage and queue writes
- one working AI example

## Suggested Starter Pages

- Home
- Shop
- Product Detail
- Cart
- Checkout
- Orders Dashboard
- Employee Tasks

## Suggested Backend Routes

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/recommend`
- `POST /api/cart`
- `POST /api/checkout`
- `GET /api/orders`
- `PATCH /api/orders/{id}`
- `GET /api/tasks`
- `POST /api/employee-assistant`

## Suggested Class Timeline

### Lecture Hour

1. Explain the retail problem and MVP.
2. Walk through frontend, backend, data, AI, and queue architecture.
3. Explain the AWS and Azure service mapping.
4. Demo the finished instructor version.
5. Explain student tasks and success criteria.

### Build Block

First 30 to 45 minutes:

- customize store branding and theme
- connect product browsing and search
- verify product data loads

Next 30 to 45 minutes:

- finish mock checkout
- save orders to shared storage
- process order state with queue simulation

Final 20 to 30 minutes:

- add AI assistant flow
- add employee workflow
- demo team variations

## Student Task Breakdown

### Required

- customize store metadata
- render products from provided data
- implement cart and mock checkout
- save order data
- implement one employee action

### Stretch Goals

- AI recommendations by shopping intent
- low-stock alert generation
- shipping-region filtering
- smarter employee assistant prompts
- custom store themes by location

## Customization Strategy

The project should be config-driven.

Students should edit a store config file, not the schema.

Suggested config:

```json
{
  "storeName": "Northwind Home Market",
  "storeType": "Home Goods",
  "storeLocation": "Chicago",
  "shippingRegions": ["Illinois", "Indiana", "Wisconsin"],
  "productCategories": ["Furniture", "Decor", "Kitchen"],
  "employeeRoles": ["Fulfillment", "Inventory", "Support"],
  "brandTone": "Helpful and practical"
}
```

## Success Criteria

The workshop is successful if a team can demo:

- a branded store
- product browsing
- AI help for a customer
- mock checkout
- a saved order
- an employee operational action

## Risks

### Scope Risk

Too many features will make the session unfinishable.

Mitigation:

- keep the workshop MVP small
- provide strong scaffolding
- treat advanced AI and cloud features as extensions

### Cloud Setup Risk

Students may lose time on credentials and deployment.

Mitigation:

- use pre-created resources when possible
- provide one shared backend resource path
- keep direct student cloud setup minimal during the session

### Data Complexity Risk

Allowing every team to invent its own schema will break the flow.

Mitigation:

- keep one shared schema
- only customize values and branding

## Recommended Next Steps

1. Finalize the common schema.
2. Pick the exact Azure and AWS service pairings.
3. Build one complete instructor demo.
4. Create the starter repo with scaffolded pages and routes.
5. Add a config-driven data generator for store variations.
6. Create lab instructions for AWS and Azure tracks separately.
