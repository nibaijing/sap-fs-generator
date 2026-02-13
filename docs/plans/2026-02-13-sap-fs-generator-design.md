# SAP FS Generator - Full Implementation Design

## Overview
AI-powered SAP Functional Specification document generator with multi-backend support and SAP SE11 integration.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 + React 19 + shadcn/ui + Tailwind CSS
- **Backend**: Next.js API routes
- **AI**: Configurable multi-backend (OpenAI API + Gemini CLI)
- **Document**: docx library for Word, exceljs for Excel
- **State**: React Context

### Component Structure
```
src/app/
├── components/
│   ├── Chat/              # AI chat interface (enhance existing)
│   ├── Template/          # Template upload & placeholder mapping
│   ├── Preview/          # Document preview before export
│   ├── SAPParser/        # SE11 Excel parser UI
│   └── Settings/          # AI backend configuration
├── api/
│   ├── chat/route.ts     # (exists)
│   ├── upload/route.ts   # (exists)
│   ├── generate/route.ts # NEW: Generate docx/xlsx
│   └── sap-parse/route.ts # NEW: Parse SE11 Excel
└── lib/
    ├── ai/               # AI backend adapters
    ├── docx/              # Document generation
    └── parser/            # SAP parsers
```

## Features

### 1. Document Generation
- AI generates structured FS content in sections
- Editable preview panel for content review
- Export to .docx with formatting (headings, tables, lists)
- Export to .xlsx for field mapping tables

### 2. SAP Integration (SE11)
- Upload SE11 Excel export
- Parse: table name, fields, data types, lengths, descriptions
- Auto-generate field mapping table
- Support DDIC structure imports

### 3. AI Configuration
- Settings page for backend selection (OpenAI/Gemini)
- API key input with env var fallback
- Model selection (gpt-4, gpt-4o, gemini-pro, etc.)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | AI chat (exists) |
| `/api/upload` | POST | File upload (exists) |
| `/api/generate` | POST | Generate docx/xlsx |
| `/api/sap-parse` | POST | Parse SE11 Excel |

## Data Flow

1. **Chat Flow**: User describes requirement → AI generates FS content
2. **Preview Flow**: Content displayed in editable preview
3. **Export Flow**: Click Export → docx library generates Word doc
4. **SAP Flow**: Upload SE11 Excel → Parse fields → Auto-populate mapping

## Acceptance Criteria

1. User can chat with AI to generate FS documents
2. User can upload .docx/.xlsx templates
3. User can upload SE11 Excel and parse field mappings
4. User can preview and edit generated content
5. User can export to .docx with proper formatting
6. User can export field mappings to .xlsx
7. User can configure AI backend (OpenAI/Gemini)
8. App handles errors gracefully with user feedback
