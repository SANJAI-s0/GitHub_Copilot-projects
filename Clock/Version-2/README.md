# World Clock V2

A modern, customizable **World Clock** web application that displays live local times for multiple cities worldwide. Built with **HTML**, **CSS**, and **JavaScript** with smooth animations, search and add functionality, and dark/light mode support.

---

## Table of Contents

- [Features](#features)
- [Files](#files)
- [Installation & Usage](#installation--usage)
- [How to Use](#how-to-use)
- [Customization](#customization)
- [License](#license)

---

## Features

- Add multiple clocks for cities worldwide using a searchable dropdown.
- Displays digital clocks with real-time updates and localized date info.
- Supports 12-hour and 24-hour time formats toggle.
- Light and Dark mode with smooth transitions and user preferences saved.
- Animated UI with GSAP for dynamic effects.
- Persistent state saved in `localStorage` (cities, theme, and time format).
- Country flags displayed alongside city names.
- Responsive grid layout adaptable to various screen sizes.

---

## Files

| File         | Description                                           |
|--------------|-------------------------------------------------------|
| `index.html` | Main HTML file with markup and container elements    |
| `style.css`  | CSS for glassmorphism style, dark mode, responsiveness|
| `app.js`     | Core JavaScript logic including state, UI, animations|
| `cities.js`  | List of world cities with timezone and country data  |

---

## Installation & Usage

1. Clone or download the repository.
2. Ensure all files are in the same directory.
3. Open `index.html` in any modern web browser.
4. Use the search field to find a city and add its clock.
5. Toggle between 12h/24h formats and dark/light modes with buttons.
6. Remove clocks by clicking the ❌ button on each clock card.

---

## How to Use

- **Search Cities**: Start typing a city or country name, then select from suggestions.
- **Add Clock**: Click the Add button or press Enter after selecting a city.
- **Toggle Time Format**: Use the 12h/24h checkbox toggle.
- **Toggle Theme**: Click the sun/moon icon button to switch light/dark modes.
- **Remove Clock**: Click the ❌ button on a clock card to remove it.

Clocks update every second to show the current time and date in the selected cities.

---

## Customization

- Edit `cities.js` to add or remove cities or update timezone info.
- Customize styles and layouts in `style.css`.
- Enhance or modify clock behavior and UI with `app.js`.
- Change flag sources or fallback emoji in the utility functions.

---

## License

This project is licensed under the MIT License.

