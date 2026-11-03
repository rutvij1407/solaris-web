**Solaris Web: a Live Flight, Satellite and Earthquake Tracker**

A browser based globe that shows live aircraft, satellites and earthquakes, with a weather radar overlay. It is the web companion to the Solaris macOS app.

**What it does**

* Plots live aircraft positions from the OpenSky Network.
* Plots satellite positions from CelesTrak.
* Shows recent earthquakes from the USGS feed.
* Overlays precipitation radar from RainViewer.
* Provides a sidebar, a heads up display and overlays to switch layers.

**How it works**

Next.js API routes fetch each feed on the server, shape the data and cache responses for a few seconds so the public APIs are not hit on every page view. A Zustand store holds the layer state, and Mapbox GL draws the globe.

**Tech stack**

Next.js 16, React 18, TypeScript, Mapbox GL, Zustand, Tailwind CSS, deployed on Vercel.

**Run it locally**

1. Install packages with npm install.
2. Create a file called .env.local containing a free Mapbox token named NEXT_PUBLIC_MAPBOX_TOKEN.
3. Start the app with npm run dev and open localhost on port 3000.

The production build passes with npm run build.

Author: Rutvij Reddy Vakati
