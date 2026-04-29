import React from 'react';

type Address = {
    street: string;
    city: string;
    zip: string;
}

type UserProfileProps = {
    name?: string;
    age: string;
    address: Address;
}

export const UserProfile: React.FC<UserProfileProps> = ({ name = 'Guest', age, address: { street, city, zip} }) => {
    // age = '500';
    return(
        <div>
            <h1>{name}</h1>
            <p>Age: {age}</p>
            <h2>Address: </h2>
            <p>{street}, {city}, {zip}</p>
        </div>
    )
}