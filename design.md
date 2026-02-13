# SAP FS Generator - Design Document

## Overview
AI-powered SAP Functional Specification document generator with multi-backend support.

## Architecture Decisions

### 1. AI Backend Strategy
- **Decision**: Multi-backend configurable
- **Supported**: OpenAI, Gemini, Anthropic, etc.
- **Config**: Environment-based API key selection

### 2. Document Structure
- **Decision**: Hybrid Mode
- **Standard Sections**: Process Flow, Logic Description, Field Mapping
- **AI generates content** within structured framework

### 3. SAP Integration
- **Decision**: Dual-mode (Import + Manual)
- **Primary**: Import SE11/SE80 exported Excel/txt
- **Fallback**: Manual input for T-codes, tables, fields
- **Parser**: Custom SE11 Excel parser

### 4. Export Formats
- **Decision**: Word (.docx) + Excel (.xlsx)
- **Libraries**: docx, exceljs
- **MVP**: .docx first, then .xlsx

## Tech Stack
- **Framework**: Next.js 16 + React 19
- **UI**: shadcn/ui
- **AI**: Configurable (OpenAI SDK as primary)
- **Document**: docx, exceljs
- **State**: React Context or Zustand

## MVP Scope
### Phase 1: Core
1. .docx template upload + placeholder filling
2. Basic AI chat interface
3. Simple content generation

### Phase 2: SAP Integration
4. SE11 Excel parser
5. Field mapping auto-generation

### Phase 3: Polish
6. Excel export for field lists
7. Multi-AI backend configuration UI

## File Structure
```
sap-fs-generator/
├── app/
│   ├── api/
│   │   └── generate/     # AI generation endpoint
│   ├── components/
│   │   ├── Chat/         # AI chat interface
│   │   ├── Template/     # Template upload/manager
│   │   └── Preview/      # Document preview
│   ├── lib/
│   │   ├── ai/           # AI backend adapters
│   │   ├── parser/       # SAP document parsers
│   │   └── docx/         # Document generation
│   └── page.tsx
├── design.md
└── TODO.md
```
