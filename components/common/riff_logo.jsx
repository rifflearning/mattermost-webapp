import React from 'react';

import RiffLogoImg from 'images/Riff-32x32.svg';
    
export const RiffLogo = props => {
    return (
        <span {...props}>
           <img 
            src={RiffLogoImg}
            alt="Riff Learning Logo"
            className='icon'
            />
        </span>
    );
}

