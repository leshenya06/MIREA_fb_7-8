const {GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLString, GraphQLInt} = require('graphql');
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'products.json');

const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: {
        id: {type: GraphQLInt},
        name: {type: GraphQLString},
        price: {type: GraphQLInt},
        description: {type: GraphQLString},
        categories: {type: new GraphQLList(GraphQLString)}
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        products: {
            type: new GraphQLList(ProductType),
            args: {
                fields: {type: new GraphQLList(GraphQLString)}
            },
            resolve(parent, args) {
                const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
                if (args.fields) {
                    return products.map(product => {
                        const filteredProduct = {};
                        args.fields.forEach(field => {
                            if (product[field] !== undefined) {
                                filteredProduct[field] = product[field];
                            }
                        });
                        return filteredProduct;
                    });
                }
                return products;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});