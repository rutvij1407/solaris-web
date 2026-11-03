**Solaris Web: a Live Flight, Satellite and Earthquake Tracker**

A browser based globe that shows live aircraft, satellites and earthquakes, with a weather radar overlay. It is the web companion to the Solaris macOS app.

**What it does**

* Plots live aircraft positions from the OpenSky Network, with the open adsb.lol feed as a backup.
* Plots satellite positions from CelesTrak.
* Shows recent earthquakes from the USGS feed.
* Overlays precipitation radar from RainViewer.
* Provides a sidebar, a heads up display and overlays to switch layers.

**How it works**

Next.js API routes fetch each feed on the server, shape the data and cache responses for a few seconds so the public APIs are not hit on every page view. A Zustand store holds the layer state, and MapLibre GL draws the globe.

**Tech stack**

Next.js 16, React 18, TypeScript, MapLibre GL, Zustand and Tailwind CSS, deployed on Vercel.

**Run it locally**

1. Install packages with npm install.
2. Start the app with npm run dev and open localhost on port 3000.

No API keys or tokens are needed. The globe uses Esri World Imagery tiles and place search uses OpenStreetMap Nominatim.

The production build passes with npm run build.

Author: Rutvij Reddy Vakati
