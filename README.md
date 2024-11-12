# Requirement

- Nest.js
- Use Moralis or Solscan API
- Relational Database System
- Swagger
- Clean code
- Dockerize to runnable on my local computer.
  - Should be run all the program by one “docker compose up (—build)” command

# Feature

1. Automatically save the Price of **Ethereum and Polygon every 5 minutes**
2. Automatically send an email to “hyperhire_assignment@hyperhire.in” if the price of a chain increases by more than 3% compared to its price one hour ago
3. API - returning the prices of each hour (within 24hours)
4. API - setting alert for specific price.(parameters are chain, dollar, email)
   EXAMPLE
   a. User can set alert 1000 dollar for ethereum
   b. If ethereum goes 1000 dollar it send email.
5. API - get swap rate (eth to btc)
   a. input is ethereum amount
   b. return values are
   i. how much btc can get
   ii. total fee (eth, dollar)(fee percentage is 0.03)
6. no user authentication required.
