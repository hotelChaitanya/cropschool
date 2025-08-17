// MongoDB initialization script
db = db.getSiblingDB('cropschool');

// Create a user for the cropschool database
db.createUser({
    user: 'cropschool_user',
    pwd: 'cropschool_password',
    roles: [
        {
            role: 'readWrite',
            db: 'cropschool'
        }
    ]
});

// Create initial collections
db.createCollection('users');
db.createCollection('children');
db.createCollection('gamesessions');

print('CropSchool database initialized successfully!');
