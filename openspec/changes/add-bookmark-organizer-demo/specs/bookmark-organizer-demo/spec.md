## ADDED Requirements
### Requirement: Bookmark import
The system SHALL import Chrome bookmarks from HTML and JSON sources and normalize them into a unified in-memory list.

#### Scenario: Import from Chrome HTML
- **WHEN** the user uploads a Chrome bookmarks HTML file
- **THEN** the system parses folders and URLs into the demo list

#### Scenario: Import from JSON
- **WHEN** the user uploads a JSON bookmarks file
- **THEN** the system parses entries into the same unified list

### Requirement: Bookmark export
The system SHALL export the current bookmarks as Chrome-compatible HTML and JSON files.

#### Scenario: Export as HTML
- **WHEN** the user selects HTML export
- **THEN** a Chrome-compatible HTML file is generated for download

#### Scenario: Export as JSON
- **WHEN** the user selects JSON export
- **THEN** a JSON file is generated for download

### Requirement: Local persistence
The system SHALL persist bookmarks and settings in the browser using IndexedDB, with automatic fallback to localStorage.

#### Scenario: IndexedDB available
- **WHEN** the browser supports IndexedDB
- **THEN** the system stores and restores data from IndexedDB

#### Scenario: IndexedDB unavailable
- **WHEN** IndexedDB is unavailable or fails
- **THEN** the system falls back to localStorage without data loss in-session

### Requirement: Deduplication and merge
The system SHALL detect duplicate bookmarks by URL and merge them based on a defined strategy.

#### Scenario: Duplicate URLs detected
- **WHEN** multiple bookmarks share the same URL
- **THEN** the system merges them and keeps a single entry

### Requirement: Reachability checks
The system SHALL test URL reachability via backend routes and record status code and response time.

#### Scenario: Batch reachability test
- **WHEN** the user runs reachability checks
- **THEN** each bookmark receives a status and latency result

### Requirement: Concurrency settings
The system SHALL provide a settings modal to configure HTTP test concurrency.

#### Scenario: Update concurrency
- **WHEN** the user changes the concurrency setting
- **THEN** subsequent checks use the new concurrency value

### Requirement: Favicon and title fetching
The system SHALL fetch favicon and page title via backend routes and update bookmark metadata.

#### Scenario: Fetch missing metadata
- **WHEN** the user runs metadata fetch
- **THEN** bookmarks with missing favicon or title are updated

### Requirement: Invalid link grouping and cleanup
The system SHALL group invalid or unreachable bookmarks and allow batch removal.

#### Scenario: Bulk delete invalid links
- **WHEN** the user selects "remove invalid"
- **THEN** unreachable bookmarks are removed from the list

### Requirement: AI organization
The system SHALL call the deepseek model via ai-sdk to generate folder path suggestions, tags, and batch rename suggestions.

#### Scenario: Generate AI folder, tags, and names
- **WHEN** the user runs AI organization
- **THEN** the system returns folder paths, tags, and rename suggestions for batch apply

### Requirement: Report export
The system SHALL export a report in CSV and JSON including URL, status code, and response time.

#### Scenario: Export CSV report
- **WHEN** the user selects CSV report export
- **THEN** a CSV file with status and latency is downloaded

#### Scenario: Export JSON report
- **WHEN** the user selects JSON report export
- **THEN** a JSON report with status and latency is downloaded

### Requirement: App demo metadata
The system SHALL read demo metadata from `src/app/demo/**/meta.json` and include it in the demo list.

#### Scenario: List app demo metadata
- **WHEN** the demo list is generated
- **THEN** app demos with valid meta.json are included alongside `_demos` entries

### Requirement: Bookmark search
The system SHALL provide text search over bookmark title, URL, tags, and folder path.

#### Scenario: Search bookmarks
- **WHEN** the user enters a search query
- **THEN** the list filters to matching bookmarks

### Requirement: Bulk editing
The system SHALL support batch edits for selected bookmarks.

#### Scenario: Apply batch edit
- **WHEN** the user applies a bulk edit action
- **THEN** selected bookmarks are updated together

### Requirement: Tag management panel
The system SHALL provide a tag panel to review and apply tags to bookmarks.

#### Scenario: Apply tag from panel
- **WHEN** the user selects a tag from the panel
- **THEN** the tag is applied or filtered as configured
