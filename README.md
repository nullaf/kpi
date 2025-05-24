# KPI Threshold Chart Component

A sophisticated, interactive KPI visualization component built for private equity operators to analyze portfolio performance metrics with customizable thresholds and annotations.

## Installation

\`\`\`bash

# Install dependencies

pnpm install

# Run development server

pnpm dev

# Build for production

pnpm build
\`\`\`

## Architecture

### Component Structure

The KPI Threshold Chart follows a modular architecture with clear separation of concerns:

1. **Data Layer**

   - `useKpiData`: React Query hook for fetching KPI data
   - `useChartStore`: Zustand store for managing thresholds and annotations
   - Automatic persistence to localStorage

2. **UI Components**

   - `KpiThresholdChart`: Main container component
   - `ThresholdPill`: Individual threshold controls
   - `AddThresholdDialog`: Modal for adding new thresholds
   - `AnnotationPopover`: Popover for managing annotations

3. **Utilities**
   - Type-safe utility functions for formatting and calculations
   - Responsive design helpers
   - Accessibility considerations

### Key Design Decisions

1. **Zustand for State Management**: Chosen for its simplicity, TypeScript support, and built-in persistence middleware.

2. **React Query for Data Fetching**: Provides caching, background refetching, and error handling out of the box.

3. **Recharts for Visualization**: Offers a declarative API with excellent React integration and customization options.

4. **ShadCN UI Components**: Provides accessible, customizable components that integrate seamlessly with Tailwind CSS.

## Features

### Interactive Thresholds

- Drag to adjust threshold values (with integer snapping)
- Lock/unlock thresholds to prevent accidental changes
- Toggle visibility for cleaner visualization
- Color-coded with automatic contrast calculation

### Annotations

- Double-click any data point to add an annotation
- Markdown support for rich text notes
- Persistent storage across sessions
- Visual indicators on the chart

### Responsive Design

- Mobile-first approach (320px to 1280px)
- Touch-friendly controls
- Adaptive layout for different screen sizes

### Performance Optimizations

- Memoized calculations for expensive operations
- Debounced position updates during resize
- Lazy loading of chart data
- Efficient re-renders with React.memo

## Usage

\`\`\`tsx
import { KpiThresholdChart } from '@/components/KpiThresholdChart';

function Dashboard() {
return (

<div className="container mx-auto p-8">
<KpiThresholdChart />
</div>
);
}
\`\`\`

## API Reference

### Types

\`\`\`typescript
interface KpiDataPoint {
month: string;
revenue: number;
timestamp: number;
}

interface Threshold {
id: string;
name: string;
value: number;
color: string;
isLocked: boolean;
isVisible: boolean;
}

interface Annotation {
id: string;
dataPointIndex: number;
month: string;
note: string;
timestamp: number;
}
\`\`\`

### Store Methods

- `addThreshold(threshold)`: Add a new threshold
- `updateThreshold(id, updates)`: Update threshold properties
- `deleteThreshold(id)`: Remove a threshold
- `addAnnotation(annotation)`: Add a new annotation
- `updateAnnotation(id, updates)`: Update annotation content
- `deleteAnnotation(id)`: Remove an annotation

## Enhancement Roadmap

### Phase 1: Data Integration

- [ ] Connect to real-time data sources
- [ ] Support for multiple KPI metrics
- [ ] Historical data comparison

### Phase 2: Advanced Analytics

- [ ] Trend analysis and forecasting
- [ ] Anomaly detection
- [ ] Statistical overlays (moving averages, standard deviations)

### Phase 3: Collaboration Features

- [ ] Multi-user annotations
- [ ] Export functionality (PDF, CSV)
- [ ] Shareable dashboard links

### Phase 4: AI Integration

- [ ] Automated threshold recommendations
- [ ] Natural language insights
- [ ] Predictive analytics

## Accessibility

The component follows WCAG 2.1 AA guidelines:

- Keyboard navigation support
- Screen reader announcements
- High contrast mode support
- Focus indicators
- Semantic HTML structure

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

Please ensure all PRs:

1. Pass TypeScript strict mode checks
2. Include unit tests for new features
3. Follow the established code style
4. Update documentation as needed

## License

MIT
\`\`\`
