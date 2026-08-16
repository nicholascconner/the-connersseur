-- Add "Upper West Side" cocktail (submitted by Eric), toggled on at the end of the Cocktails section

INSERT INTO menu_items (name, description, ingredients, category, is_active, sort_order) VALUES
(
    'Upper West Side',
    'A Western take on the classic Manhattan: rich, balanced, and caramel-filled.',
    'Whiskey, Rye, Amaro, Antica Formula',
    'Cocktails', true, 132
)
ON CONFLICT DO NOTHING;
