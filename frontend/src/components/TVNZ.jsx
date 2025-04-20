import React from 'react';
import { useState, useEffect } from 'react';
import Iframe from 'react-iframe';
import '../App.css';

function TVNZ() {

    return (
        <Iframe src="https://www.tvnz.co.nz/" 
                    title="TVNZ+"
                    width="100%"
                    height="100%"> 
            </Iframe>
    );
} export default TVNZ;