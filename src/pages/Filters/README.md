# Filter Management Components Documentation

## Overview
A professional filter management system for creating and managing filter groups and their options for each product category.

## Components

### 1. **Filters.jsx** (Main Container)
The main component that manages the entire filter system.

**Features:**
- Category selector
- View/Create/Edit filter groups
- Manage filter options for each group
- Real-time sync with API

**Props:** None (standalone component)

**Example Usage:**
```jsx
import { Filters } from "@/pages/Filters";

function AdminDashboard() {
  return <Filters />;
}
```

---

### 2. **FilterGroupForm.jsx**
Form component for creating and editing filter groups.

**Props:**
- `initialData` (object, optional) - Pre-filled data for editing
- `onSubmit` (function) - Callback when form is submitted
- `onCancel` (function) - Callback when cancel button is clicked

**Form Fields:**
- `name` - Internal name (no spaces, lowercase)
- `displayName` - Customer-facing name
- `filterType` - Type of filter (checkbox, range, dropdown, color, size)
- `description` - Optional description

**Example:**
```jsx
<FilterGroupForm
  initialData={null}
  onSubmit={(data) => console.log(data)}
  onCancel={() => {}}
/>
```

---

### 3. **FilterGroupList.jsx**
Displays all filter groups in a category with action buttons.

**Props:**
- `groups` (array) - List of filter group objects
- `onEdit` (function) - Called when edit button is clicked
- `onDelete` (function) - Called when delete button is clicked
- `onManageOptions` (function) - Called when manage options is clicked
- `loading` (boolean) - Show loading state

**Features:**
- Display filter type badge
- Show active/inactive status
- Display option count
- Quick action buttons

---

### 4. **FilterOptionsManager.jsx**
Main manager for filter options within a group.

**Props:**
- `group` (object) - The parent filter group
- `onBack` (function) - Callback to go back to filter list

**Features:**
- Create new options
- Edit existing options
- Delete options
- Real-time API sync
- Inline form for creating/editing

---

### 5. **FilterOptionForm.jsx**
Form for creating and editing individual filter options.

**Props:**
- `filterType` (string) - Type of filter (determines form fields)
- `initialData` (object, optional) - Pre-filled data for editing
- `onSubmit` (function) - Callback when form is submitted
- `onCancel` (function) - Callback when cancel is clicked

**Form Fields:**
- `label` - Display text (e.g., "Full HD")
- `value` - Internal value (e.g., "full_hd")
- `color` - Color picker (only for color filter type)
- `displayOrder` - Order of display in UI

---

### 6. **FilterOptionsList.jsx**
Displays all filter options for a group.

**Props:**
- `options` (array) - List of filter option objects
- `filterType` (string) - Type of filter (for rendering color previews)
- `onEdit` (function) - Called when edit button is clicked
- `onDelete` (function) - Called when delete button is clicked
- `loading` (boolean) - Show loading state

---

## API Integration

### Required API Endpoints

**Get all categories:**
```
GET /api/category
```

**Filter Groups:**
```
POST /api/filter-groups
GET /api/filter-groups/category/:categoryId
GET /api/filter-groups/:id
PUT /api/filter-groups/:id
DELETE /api/filter-groups/:id
```

**Filter Options:**
```
POST /api/filter-options
GET /api/filter-options/group/:groupId
PUT /api/filter-options/:id
DELETE /api/filter-options/:id
```

---

## Data Structures

### Filter Group Object
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  name: "resolution",
  displayName: "Resolution",
  category: "507f1f77bcf86cd799439010",
  filterType: "checkbox",
  description: "Filter products by resolution",
  displayOrder: 0,
  status: "active",
  options: [ /* FilterOption objects */ ],
  createdAt: "2024-02-16T10:30:00Z",
  updatedAt: "2024-02-16T10:30:00Z"
}
```

### Filter Option Object
```javascript
{
  _id: "507f1f77bcf86cd799439012",
  label: "Full HD",
  value: "full_hd",
  filterGroup: "507f1f77bcf86cd799439011",
  color: null,
  displayOrder: 0,
  status: "active",
  createdAt: "2024-02-16T10:30:00Z",
  updatedAt: "2024-02-16T10:30:00Z"
}
```

---

## Usage Workflow

### 1. **Create a Filter Group**
1. Navigate to Filters page
2. Select a category
3. Click "Create Filter Group"
4. Fill in the form:
   - Name: `resolution` (internal)
   - Display Name: `Resolution` (customer-facing)
   - Filter Type: `checkbox`
5. Click "Create Filter Group"

### 2. **Add Filter Options**
1. Find the created filter group
2. Click "Manage Options"
3. Click "Add Option"
4. Fill in the form:
   - Label: `Full HD`
   - Value: `full_hd`
   - Display Order: `0`
5. Click "Create Option"
6. Repeat for other options

### 3. **Edit/Delete**
- **Edit**: Click "Edit" on the filter group/option
- **Delete**: Click "Delete" and confirm

---

## Styling

All components use **Tailwind CSS** for styling. Key classes:

- **Colors**: Yellow (primary), Blue (info), Red (danger), Green (success)
- **Spacing**: Consistent padding/margins for professional appearance
- **Shadows**: Subtle shadows for depth
- **Transitions**: Smooth hover effects
- **Responsive**: Mobile-first design (works on all screen sizes)

---

## Integration Checklist

- [ ] Add route in Admin Dashboard
- [ ] Ensure API endpoints are available
- [ ] Test create filter group
- [ ] Test create filter options
- [ ] Test edit/delete operations
- [ ] Test on mobile devices
- [ ] Verify API error handling

---

## Troubleshooting

**Issue**: "Category not found"
- Ensure categories are created first

**Issue**: "Filter options not loading"
- Check if filter group ID is correct
- Verify API endpoint is accessible

**Issue**: "Can't create filter group"
- Ensure all required fields are filled
- Check browser console for API errors

---

## Future Enhancements

- [ ] Drag-and-drop to reorder options
- [ ] Bulk import/export filters
- [ ] Filter templates by category
- [ ] Real-time search/filter
- [ ] Multi-language support
- [ ] Filter analytics/usage tracking

