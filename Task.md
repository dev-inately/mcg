# MyCoverGenius Backend Engineer Assessment

## Goal
Implement a mini insuretech API where anybody can buy a particular
product (called a plan) using their wallet and activate the slots under the plan to
get a policy.

The following definition of terms should be adhered to when building the API
1. Product: These are entities with a price tag associated with them. They are
divided into two categories: Health category and Auto Category.
The following are the health products that we have: Optimal care mini
each priced at 10000 naira and Optimal care standard priced at 20000
naira
The auto products are also of 2 types: Third-party priced at 5000 naira per
product and Comprehensive priced at 15000 naira per product.

2. Product category: This groups various products under a single category

3. Plan: When a product is bought, a plan is created. The amount paid per plan
is determined by the number of products purchased. When a plan is
purchased, slots called pending policies are created and the number of slots
being purchased is equivalent to the number of products bought.

4. Pending policies: These are associated with plans and their quantity is
determined by the units specified during a plan purchase. For example, If I
purchase a plan containing 2 Optimal care mini products, it means that I
will pay a total of 20,000 (10,000 each) from my wallet and 2 slots will be
created under the pending policies table.
It should be noted that these slots have 2 states, when newly created they
are in their unused state and when activated (creation of a policy), they
are in their used state and soft deleted from the database.

5. Policies: These are activated pending policies with a unique random
generated number called policy number that the user can use. Each policy
associated with a product should be attached to a specific user and no two
users can have more than one type of policy under a product.

## Acceptance Criteria
1. I should be able to call an endpoint to fetch the various specified
products and see the their associated product category and price

2. I should be able to call an endpoint to buy a plan and my wallet should be
deducted based on the quantity specified during purchase

3. I should be able to call an endpoint to see the list of pending policies
under a plan

4. I should be able to activate each pending policy under a plan via an
endpoint and on activation the pending policy should be soft deleted

5. I should be able to see a list of all activated policies and also filter them by
plan

6. A user should have only one policy in a plan

## Things to note
1. The relationship with all these entities must be well thought out and
implemented
2. No authentication API for users should be built, you can make use of
seeding to add certain information into your database
3. Write some amount of test case (unit or integration tests) to test your API
4. Push your completed work to GitHub under a public repository and add a
well detailed readme on how to test the application

This task should be submitted latest by 29th August, 2025 by 5PM. An email
should be sent containing details of your completed work.
You can call me 08160161074 or send an email if you have any questions.
Tech stacks: NestJS, Sequelize-TypeScript, Postgres