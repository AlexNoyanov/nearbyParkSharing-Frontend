# Feature Toggle System

This app uses a feature toggle system to enable/disable different parts of the application dynamically without deploying new code.

## How It Works

1. **Frontend**: Before showing any screen, the app checks if the feature is enabled by making a request to `https://noyanov.com/api/feature-toggles.php`
2. **Backend**: The PHP script returns whether the feature is enabled or disabled
3. **Fallback**: If the API request fails, the app uses default feature states
4. **Placeholder**: When a feature is disabled, a placeholder screen is shown with a message

## Deployment

### PHP Script Deployment

1. Upload `config.php` to your server at:
   ```
   https://noyanov.com/Apps/ParkShare/config.php
   ```

2. Ensure the directory structure exists:
   ```bash
   mkdir -p Apps/ParkShare
   ```

3. Ensure the file has proper permissions:
   ```bash
   chmod 644 config.php
   ```

4. Verify PHP is enabled on your server

5. Test the endpoint:
   ```bash
   curl "https://noyanov.com/Apps/ParkShare/config.php?feature=home"
   ```

### Configuration

Edit the `$featureToggles` array in `feature-toggles.php` to enable/disable features:

```php
$featureToggles = [
    'onboarding1' => true,
    'onboarding2' => true,
    'home' => true,
    'search' => true,
    'rent' => false,      // Disabled
    'profile' => false,   // Disabled
    // ... etc
];
```

## Available Features

- `onboarding1` - First onboarding screen
- `onboarding2` - Second onboarding screen
- `onboarding-final` - Final onboarding screen
- `login` - Login screen
- `registration` - Registration screen
- `code-verification` - Code verification screen
- `home` - Home screen
- `search` - Search screen
- `details` - Parking details screen
- `summary` - Booking summary screen
- `active` - Active bookings screen
- `rent` - Rent out parking screen
- `profile` - Profile screen
- `chat` - Chat screen

## API Endpoint

### Request

```
GET https://noyanov.com/Apps/ParkShare/config.php?feature=<feature_key>
```

### Response

```json
{
  "enabled": true,
  "message": "Optional message"
}
```

### Example

```bash
# Check if home feature is enabled
curl "https://noyanov.com/Apps/ParkShare/config.php?feature=home"

# Response:
# {"enabled":true}
```

## Advanced Configuration

### Using Environment Variables

Uncomment the environment variable section in `feature-toggles.php` and create a `.env` file:

```env
onboarding1=true
onboarding2=true
home=true
rent=false
```

### Using Database

Uncomment the database section in `feature-toggles.php` and configure your database connection. Create a table:

```sql
CREATE TABLE feature_toggles (
    feature_key VARCHAR(50) PRIMARY KEY,
    enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Caching

The frontend caches feature toggle responses for 5 minutes to reduce API calls. The cache is automatically cleared when needed.

## Error Handling

- If the API request fails, the app uses default feature states
- Network timeouts are set to 3 seconds
- All errors are logged to the browser console

## Testing

To test feature toggles:

1. Disable a feature in `config.php`
2. Navigate to that feature in the app
3. You should see a placeholder screen instead

Example: Set `'home' => false` and try to navigate to the home screen.

