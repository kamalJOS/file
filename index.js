const fs = require('fs');

const path = require('path');


//this helper class provides 
//method's to
//a: get array of file names in a given directory 
//b: sort an array using Merge Sort
//c: convert a string to lowercase
class Helper {

    constructor() {
        this.fileArray;
    }

    
    //lowercase
    returnLowerCasedWord(word) {
        return word.toLowerCase();
    }

    //reads files from the specified folder
    readFilesFromDir(folder) {

        const folderPath = path.resolve(__dirname, folder);
        this.fileArray = fs.readdirSync(folderPath);

    }

    //return the array of file names
    getFilesFromDir(folder) {

        this.readFilesFromDir(folder);
        return this.fileArray;

    }

    //method for merging two array's
    merge(arr, l, m, h) {
        const n1 = m-l+1, n2 = h-m, arr1 = [], arr2 = [];

        //creating the two array
        let i, j, k;
        for(i=0; i<n1; i++) arr1[i]=arr[l+i];
        for(j=0; j<n2; j++) arr2[j]=arr[m+j+1];
    
        i=0, j=0, k=l;
    
        //merging the array
        while(i<n1 && j<n2) {
            if(arr1[i]<=arr2[j]) arr[k++]=arr1[i++];
            else arr[k++]=arr2[j++];
        }
    
        while(i<n1) arr[k++]=arr1[i++];
        while(j<n2) arr[k++]=arr2[j++];
    }


    merge_sort(arr, low, high) {
        let mid;
        if(low<high) {
            mid = Math.floor((low+high)/2);
    
            //Divide and Conquer
            this.merge_sort(arr, low, mid);
            this.merge_sort(arr, mid+1, high);
    
            //Combine
            this.merge(arr, low, mid, high);
        } 
    }

}


//program extends Helper Class
//and provides method's for
//creating map's for
//a: word to exclude
//b: words to add
//c: writing result to a file
class Program extends Helper {

    constructor() {

        super();
        this.excludeMap = new Map();
        this.dataMap = new Map();

    }

    createExcludeMap() {

        const excludeFiles = this.getFilesFromDir('exclude');

        for(const file of excludeFiles) {
            const filePath = path.resolve(__dirname, `exclude/${file}`);

            //read a particular file
            const wordArray = fs.readFileSync(filePath, {encoding: 'utf8'}).split('\n');
            
            for(const word of wordArray) {
                //convert the word to lowercase
                const LCWord = this.returnLowerCasedWord(word);

                //word is not a empty string and words are unique
                if(LCWord.length > 0 && !this.excludeMap.has(LCWord)) {
                    this.excludeMap.set(LCWord, 0);
                }
            }
        }
    }

    createDataMap() {

        const dataFiles = this.getFilesFromDir('data');
        //variable to mantain file number/name
        let currentFile=1;
        
        for(const file of dataFiles) {
            const filePath = path.resolve(__dirname, `data/${file}`);

            //read a particular file
            const lineArray = fs.readFileSync(filePath, {encoding: 'utf8'}).split('\r\n');
            
            //work on each line
            for(const stringArray of lineArray) {
                
                //work on each string
                for(const str of stringArray.split(' ')) {
                    //replace characters with a space
                    const exp = /[0-9]|\`|\"|\'|\;|\:|\~|\!|\@|\$|\%|\^|\&|\*|\(|\[|\{|\)|\]|\}|\-|\_|\=|\+|\,|\.|\/|\\|\|/g;
                    const refinedString = str.replaceAll(exp, ' ');

                    
                    //from here we can have words
                    for(const word of refinedString.split(' ')) {
                        //convert the word to lowercase
                        const LCWord = this.returnLowerCasedWord(word);
                        
                        //if word is an empty string or word is not unique
                        //move to the next word
                        if(LCWord.length === 0 || this.excludeMap.has(LCWord)) continue;
                        
                        //if word is already present
                        if(this.dataMap.has(LCWord)) {
                            //get the previous value 
                            const nextValue = [...this.dataMap.get(LCWord)];
                            
                            //if file name is already added
                            //move to the next word
                            if(nextValue.includes(currentFile)) continue;

                            //push the new file name
                            nextValue.push(currentFile);

                            //update the Map
                            this.dataMap.set(LCWord, nextValue);

                        //create a new key-value pair in the Map
                        } else this.dataMap.set(LCWord, [currentFile]);
                    }
                }
            } currentFile++;
        }
    }


    writeOutputToFile() {
        //create an array from key in the Map
        const keysArray = Array.from(this.dataMap.keys());

        //sort these keys
        this.merge_sort(keysArray, 0, keysArray.length-1);

        //create a "key : value" string
        const dataStringArray = keysArray.map(key => `${key} : ${this.dataMap.get(key)}`);

        //join the string's into a single string
        //and write into the file by appending a newline character
        const filePath = path.resolve(__dirname, 'output/index.text');
        fs.writeFileSync(filePath, dataStringArray.join('\n'));
    
    }
}


const program = new Program();

program.createExcludeMap();
program.createDataMap();
program.writeOutputToFile();





