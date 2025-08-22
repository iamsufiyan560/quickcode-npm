# QuickCode UI

> [!UPDATE]  
> QuickCode UI is live! 🚀 It’s production-ready, but currently offers only a limited set of components. More are being added every 2–3 days to support larger projects.

## Description

QuickCode UI offers over 100 high-quality, animated components designed specifically for Next.js projects. These components are fully compatible with Tailwind CSS, Framer Motion for smooth animations, and Lucide icons for versatile iconography. You can integrate them directly via the npm package or copy-paste the code from the [QuickCode UI App](https://quickcode.space) without any installation required.

If you're not sure where to start or need clarification, jump to the Installation and Usage sections below—they provide step-by-step guidance to get you up and running quickly.

## Installation

Install the package via npm:

```bash
npm install quickcode-ui
```

Alternatively, use npx to add specific components directly to your project

```bash
npx quickcode-ui add Button Accordion Chart/LineChart AnimatedList
```

This command will generate the component code in your `components/ui` folder.

## Usage

Once installed, import and use the components in your Next.js project:

```tsx
import { AnimatedList } from "./components/ui/AnimatedList";

export default function Home() {
  const items = ["First Item", "Second Item", "Third Item"];

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">QuickCode UI Demo</h1>
      <AnimatedList items={items} />
    </main>
  );
}
```

Start your development server:

```bash
npm run dev
```

All components come pre-animated and ready for immediate use. Swap in any other component as needed to build your UI efficiently.

## Components

QuickCode UI includes over 100 polished, animated components, such as Buttons, Accordions, Charts, and more. It supports specialized variants like `Chart/LineChart`, `Chart/BarChart`, and others for data visualization and interactive elements.

## Why Use QuickCode UI?

- Accelerate your development workflow with pre-built, customizable components that integrate seamlessly.
- Access components instantly from the [QuickCode UI App](https://quickcode.space) and integrate them directly into your Next.js projects for rapid prototyping.
- Built with modern standards: responsive, accessible, and optimized for performance in Next.js environments.

## Author

- GitHub: [iamsufiyan560](https://github.com/iamsufiyan560)
- X/Twitter: [@iamsufiyan560](https://x.com/iamsufiyan560)
- Portfolio : [SUFIYAN](https://sufiyan-dev.vercel.app)

## License

Copyright 2025 Sufiyan Chaudhari
This project is licensed under the MIT License.
