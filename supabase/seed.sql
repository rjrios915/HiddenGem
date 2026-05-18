-- Sample activities for development/demo
-- Run this after schema.sql to populate initial data

INSERT INTO public.activities (
  title, description, category, latitude, longitude,
  price_level, rating, review_count, source, url, image_url,
  address, hidden_gem_score
) VALUES
  (
    'Sightglass Coffee',
    'A beautifully designed SoMa roastery with exceptional single-origin pour-overs and a quiet mezzanine perfect for solo work sessions.',
    'cafes', 37.7762, -122.4041, '$', 4.4, 1847,
    'yelp', 'https://sightglasscoffee.com', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    '270 7th St, San Francisco, CA', 7.2
  ),
  (
    'Clarion Alley Mural Project',
    'A constantly evolving outdoor gallery of politically charged and culturally vibrant murals tucked in the Mission District. Free, always open.',
    'art', 37.7601, -122.4198, 'free', 4.7, 312,
    'local', 'https://claionalleymuralproject.org', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
    'Clarion Alley, San Francisco, CA', 9.1
  ),
  (
    'Lands End Trail',
    'A dramatic coastal trail with Golden Gate views, hidden staircases, and labyrinth ruins. Uncrowded early morning. Dogs welcome.',
    'outdoors', 37.7791, -122.5079, 'free', 4.8, 2104,
    'google', 'https://www.nps.gov/goga/planyourvisit/landsend.htm', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    'Lands End, San Francisco, CA', 8.4
  ),
  (
    'The Interval at Long Now',
    'A bar inside a museum dedicated to 10,000-year thinking. Cocktails named after geological epochs, a full library of civilization-scale books.',
    'nightlife', 37.8067, -122.4185, '$$', 4.6, 441,
    'yelp', 'https://theinterval.org', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
    '2 Marina Blvd, San Francisco, CA', 9.3
  ),
  (
    'Tartine Manufactory',
    'The expanded bakery empire from Chad Robertson. Arrive early for the croissants. The pizza at lunch is an underrated secret.',
    'food', 37.7621, -122.4133, '$$', 4.5, 3201,
    'yelp', 'https://tartinemanufactory.com', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    '595 Alabama St, San Francisco, CA', 6.8
  ),
  (
    'Creativity Explored',
    'A nonprofit gallery where artists with developmental disabilities create and sell their work. Rotating exhibitions, a small shop.',
    'art', 37.7633, -122.4118, 'free', 4.9, 187,
    'local', 'https://creativityexplored.org', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    '3245 16th St, San Francisco, CA', 9.5
  ),
  (
    'Haight Ashbury Free Clinic',
    'Volunteer-run community wellness center offering yoga, meditation, and free health services since 1967. Open to all.',
    'wellness', 37.7699, -122.4469, 'free', 4.3, 94,
    'local', 'https://hafci.org', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    '558 Clayton St, San Francisco, CA', 8.8
  ),
  (
    'Mechanics Institute Chess Club',
    'Founded in 1854, one of the oldest chess clubs in the US. Drop-in play Thursday evenings in a stunning historic reading room.',
    'gaming', 37.7883, -122.4033, '$', 4.7, 156,
    'local', 'https://www.milibrary.org', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    '57 Post St, San Francisco, CA', 9.0
  ),
  (
    'Bernal Heights Park',
    'A quiet hilltop park with 360-degree city views, free of crowds even on weekends. Local dogs, wildflowers, and stunning sunset light.',
    'outdoors', 37.7401, -122.4152, 'free', 4.8, 728,
    'google', 'https://sfrecpark.org', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'Bernal Heights Blvd, San Francisco, CA', 8.6
  ),
  (
    'Sweat Shop Fitness',
    'Tiny neighborhood gym run by a former MMA trainer. Powerlifting focus, $10 drop-ins, zero attitude. Genuinely welcoming.',
    'fitness', 37.7587, -122.4119, '$', 4.9, 63,
    'yelp', 'https://sweatshopsf.com', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    '473 Alabama St, San Francisco, CA', 9.2
  ),
  (
    'El Rio',
    'A legendary dive bar with a backyard stage. Rotating free and low-cost shows, a fiercely queer and welcoming vibe.',
    'music', 37.7487, -122.4183, '$', 4.6, 892,
    'yelp', 'https://elriosf.com', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    '3158 Mission St, San Francisco, CA', 7.9
  ),
  (
    'Omnivore Books',
    'A tiny cookbook-only bookshop in Noe Valley. Author readings, signed first editions, the rare food writing you cannot find elsewhere.',
    'workshops', 37.7507, -122.4312, '$', 4.9, 211,
    'yelp', 'https://omnivorebooks.com', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
    '3885 César Chávez St, San Francisco, CA', 9.4
  );
