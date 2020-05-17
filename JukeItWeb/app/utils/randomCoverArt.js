import cover1 from '../images/covers/cover1.jpg';
import cover2 from '../images/covers/cover2.jpg';
import cover3 from '../images/covers/cover3.jpg';
import cover4 from '../images/covers/cover4.jpg';
import cover5 from '../images/covers/cover5.jpg';
import cover6 from '../images/covers/cover6.jpg';
import cover7 from '../images/covers/cover7.jpg';
import cover8 from '../images/covers/cover8.jpg';
import cover9 from '../images/covers/cover9.jpg';
import cover10 from '../images/covers/cover10.jpg';
import cover11 from '../images/covers/cover11.jpg';
import cover12 from '../images/covers/cover12.jpg';
import cover13 from '../images/covers/cover13.jpg';
import cover14 from '../images/covers/cover14.jpg';
import cover15 from '../images/covers/cover15.jpg';
import cover16 from '../images/covers/cover16.jpg';
import cover17 from '../images/covers/cover17.jpg';
import cover18 from '../images/covers/cover18.jpg';
import cover19 from '../images/covers/cover19.jpg';
import cover20 from '../images/covers/cover20.jpg';

const covers = [
    cover1,
    cover2,
    cover3,
    cover4,
    cover5,
    cover6,
    cover7,
    cover8,
    cover9,
    cover10,
    cover11,
    cover12,
    cover13,
    cover14,
    cover15,
    cover16,
    cover17,
    cover18,
    cover19,
    cover20,
];

export default function randomCoverArtGenerator() {
    let generator = {
        covers: covers.slice(),
        current: 0,
        shuffled: false,
    };

    generator.shuffle = function() {
        // shuffle the covers to create a permutation      
        for(let i = 0; i < generator.covers.length; i++)
        {
            var swapIdx = i + Math.floor(Math.random() * (generator.covers.length - i));
            // swap elements at i and swapIdx
            var tmp = generator.covers[i];
            generator.covers[i] = generator.covers[swapIdx];
            generator.covers[swapIdx] = tmp;
        }
        generator.current = 0;
        generator.shuffled = true;
    }    

    generator.next = function() {
        if(!generator.shuffled) {
            generator.shuffle();
        }
        const idx = generator.current;
        generator.current += 1;
        generator.current %= generator.covers.length;
        return generator.covers[idx];        
    }

    return generator;
}
