import neo4j from "neo4j-driver";

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PASS = process.env.NEO4J_PASS;
const driver = neo4j.driver(String(NEO4J_URI), neo4j.auth.basic(String(NEO4J_USER), String(NEO4J_PASS)));
const session = driver.session();

export type Locality = {
  localityName: string,
  mongoId: string,   
} 

type GraphNode = {
  identity: { low: number, high: number },
  labels: Array<string>,
  properties: { mongoId: string, name: string },
  elementId: string  
} 

const getGraphQuery = (argFrom: string, argTo: string): Promise<{ cities: Array<Locality>, direction: string }> =>
  new Promise(function (resolve, reject) {   
    const readQuery: String = `MATCH (n:City5{mongoId: $argFrom}), (m:City5{mongoId: $argTo})
                               MATCH p=shortestPath((n)-[*]->(m))
                               RETURN nodes(p) as nodes, relationships(p) as rels`;
    const cities: Array<Locality> = [];                                                                  
    let direction;
    session.run(readQuery, { argFrom, argTo }).then(function (result) {      
     
      if (result.records && result.records.length > 0) {

        result.records.map((record) => {

          record.get("nodes").map((node: GraphNode) => {
              cities.push({
                localityName: node.properties.name,
                mongoId: node.properties.mongoId,
              });
          }
          )                     
          direction = record.get("rels")[0].type
          resolve({ cities, direction });
        });  
      } else return;
      }).catch ((error) => {        
        driver.close();
      });
  });

  export { getGraphQuery as getGraphData };
