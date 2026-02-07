
const badHtml = `
To get better price,Learn more about
                        Business
                        VIP
                        
                    

                                        
                    
                                        

                    
                        
                        
                            
     Availability: In stock

                
    
            
    
                                
                                        
                        
                                                
                                            
                            
                                Retail
                                                                    $119.00                                                                
                                    +GST
                                
                            
                            
                                Business
                                \n                                    Login to see price\n                                \n                            \n                        \n                                        \n\n                    \n                                                    $119.00                                                \n                            +GST\n                        \n                    \n                    \n                                                            \n        \n\n                                                \n                                                    \n                            \n                            \n                            \n                                                        \n                                                \n                                                                                                    \n                        \n                                                    \n                                                                    \n    .product-view  .add-to-cart {\n        display: flex;\n        flex-direction: column;\n        border: 0!important;\n        padding: 10px!important;\n    }\n    .product-view .add-to-box, .product-view .login-for-price {\n        border: 0;\n        border-radius: 4px 4px 0 0;\n        padding: 0px;\n    }\n\n    .product-view .add-to-cart > .item {\n        /*margin-top: 15px;*/\n        text-transform: none;\n        margin-bottom: 15px;\n    }\n\n    .product-view .add-to-cart > label {\n        margin: 0;\n    }\n\n    .product-view  .add-to-cart .qty-input-box {\n        display: flex;\n    }\n\n    /*google*/\n    .qty-input-box input::-webkit-outer-spin-button,\n    .qty-input-box input::-webkit-inner-spin-button {\n        -webkit-appearance: none;\n    }\n\n    /*firefox*/\n    .qty-input-box input[type=\"number\"] {\n        -moz-appearance: textfield;\n    }\n\n    .product-view input.qty {\n        border: 1px solid #ddd;\n        border-radius: 0;\n        height: auto;\n        margin-right: 5px;\n    }\n\n    .product-view  .add-to-cart .qty-input-box button {\n        padding: 5px 8px;\n        border: 0;\n        background-color: #999;\n        color: white;\n        border-radius: 2px;\n        margin-right: 5px;\n    }\n    .isSpecialHeavy-tips{\n        color: red;\n        font-size: 15px;\n        font-weight: bold;\n        margin: 10px 0;\n    }\n\n\n\n\n\n\n\n    Register Business Partner account for better prices\n\n\n    \n                    Quantity:\n            \n                \n                \n                    \n                \n                \n                    \n                \n            \n                        \n             Add to Cart\n        \n\n        
        
            
                Having problem add to cart?
            
            
                You can use the old version button below:
                
                    Add to Cart
`;

function cleanDescription(html) {
    if (!html) return '';
    let description = html;

    // Remove scripts and styles
    description = description.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    description = description.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, ""); // Assuming valid style tags, though text above has raw CSS without tags which is tricky if no tags present. 
    // Wait, the raw CSS in the user input seems to be JUST text content? 
    // Looking at the JSON: "description": "...\n .product-view .add-to-cart { ... } ..."
    // It seems the scraper stripped the `<style>` tags but left the content?
    // Or maybe the browser tool dumped innerText?
    // No, `html.match` extracts HTML. So `div.std` contains `<style>...</style>`.

    // The previous regex in my code handled <style>...</style>. 
    // If the input `badHtml` has raw CSS *without* style tags, my regex won't catch it.
    // I should check if I can assume style tags are present in the original HTML.
    // The user's JSON string shows raw text, but that's likely because JSON escaping makes it look like that, or the previous scraper version regex captured everything.
    // If the previous regex used `match()[1]`, it captured innerHTML. So tags SHOULD be there.

    // Let's assume tags are present for now, but I'll add a heuristic for raw CSS just in case.

    // Removing CSS block if it looks like CSS
    description = description.replace(/\.product-view\s+\.add-to-cart\s*\{[\s\S]*?\}/gim, "");

    // Remove CDATA
    description = description.replace(/\/\/<!\[CDATA\[[\s\S]*?\/\/\]\]>/gim, "");
    // Remove specific garbage text
    description = description.replace(/To get better price,Learn more about[\s\S]*?VIP/gim, "");
    description = description.replace(/Availability:\s*In stock/gim, "");
    description = description.replace(/Register Business Partner account for better prices/gim, "");
    description = description.replace(/Add to Cart/gim, "");
    description = description.replace(/Having problem add to cart\?/gim, "");

    // Collapse whitespace
    description = description.replace(/\n\s*\n/g, "\n");
    return description.trim();
}

console.log("--- ORIGINAL ---");
console.log(badHtml.substring(0, 200) + "...");
console.log("--- CLEANED ---");
console.log(cleanDescription(badHtml));
