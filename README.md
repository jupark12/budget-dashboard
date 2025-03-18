# Budget Project

Frontend was spinned up with T3 stack, just using React Typescript, Material-UI, and Tailwind. The dashboard is simply made to extract transaction data from my Bank of America bank statements pdf files.

## Project Structure
The project consists of three main components:

1. Budget Dashboard (Frontend): React/TypeScript application with Material UI
2. [Transaction API](https://github.com/jupark12/transaction-api) : Backend service for managing transaction data
3. [Go Job Queue](https://github.com/jupark12/go-job-queue) : Background processing system for handling time-consuming tasks like extracting transaction data from pdfs

### Backend (Transaction API)
- RESTful API : Standard HTTP methods for CRUD operations
- Transaction Processing : Handling financial data with proper validation
- Error Handling : Robust error responses for client feedback
### Background Processing (Go Job Queue)
- Job Queue Pattern : Offloading time-consuming tasks to background workers
- Concurrency : Parallel processing of multiple jobs
- State Management : Tracking job status and progress

## Implementation Highlights
- Real-time Updates : The frontend refreshes transaction data when background jobs complete, using a websocket
- Optimistic UI : Interface updates immediately before server confirmation
- Modular Architecture : Clean separation of concerns between components

## Getting Started
1. Start the [Go Job Queue](https://github.com/jupark12/go-job-queue) service
2. Launch the [Transaction API](https://github.com/jupark12/transaction-api)
3. Run the Budget Dashboard frontend

```bash
npm install
npm run dev
```

## Demo
[Budget Project.webm](https://github.com/user-attachments/assets/253f0488-b2a5-468a-a044-34cdf2639643)
