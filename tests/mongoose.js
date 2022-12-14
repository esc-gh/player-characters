const mongoose = require("mongoose")
const chai = require("chai");
chai.use(require("chai-http"));

const server = require("../index.js");

const pcModel = require("../routes/mongoose.js");

describe("Player Characters API", function() {

    const TestPc = {
        "name": "Roweena",
        "race": "Human",
        "class": "Bard",
        "level": 11,
        "spells": [
            {
                "name": "Greater Invisibility",
                "level": 4,
                "school": "Illusion"
            },
            {
                "name": "Message",
                "level": 0,
                "school": "Transmutation"
            }
        ]
    }

    this.beforeAll("Test Database", async function(){
        await mongoose.connection.close();
        await mongoose.connect("mongodb://127.0.0.1:27017/players")
    })

    this.beforeEach("Test Data", async function(){
        // console.log(pcModel)
        await pcModel.remove({})
        await pcModel.create(TestPc)
    })

    this.afterAll("Shut Down", function(){
        server.close();
        mongoose.connection.close();
    })

    it("/getAll Test", function(){
        chai.request(server).get("/mongo/getAll").end((err, res) => {
            chai.expect(err).to.be.null;
            chai.expect(res.status).to.eql(200)

            chai.expect(res.body.length).to.eql(1);

            chai.expect(res.body[0].name).to.eql(TestPc.name)
            chai.expect(res.body[0].race).to.eql(TestPc.race)
            chai.expect(res.body[0].class).to.eql(TestPc.class)
            chai.expect(res.body[0].level).to.eql(TestPc.level)
            chai.expect(res.body[0].spells).to.eql(TestPc.spells)
        })
    })

    it("/create", function(){

        const pc = {
            "name": "Mad",
            "race": "Human",
            "class": "Fighter",
            "level": 6
        }
        
        chai.request(server).put("/mongo/create").send(pc).end( (err, res) => {
            chai.expect(err).to.be.null;

            chai.expect(res.status).to.equal(201)
            chai.expect(res.body).to.be.not.equal({});

            pc._id = res.body._id;
            pc.__v = res.body.__v;
            chai.expect(JSON.stringify(res.body) === JSON.stringify(pc)).to.be.true 
        })
    })

    it("/update", async function(){
            const body ={
                "name": "Mad",
                "race": "Human",
                "class": "Fighter",
                "level": 6
            }

            pcModel.findOne({}).then(t => {
                chai.request(server).post(`/mongo/update/${t.id}`).send(body).then((res) => {
                    chai.expect(res.status).to.eql(200)  
    
                    chai.expect(res.body).to.have.property("New");
                    chai.expect(res.body).to.have.property("Old");
    
                    chai.expect(res.body.New.name).to.eql(body.name);
                    chai.expect(res.body.Old.name).to.eql(TestPc.name);
    
                    chai.expect(res.body.New.race).to.eql(body.race);
                    chai.expect(res.body.Old.race).to.eql(TestPc.race);
    
                    chai.expect(res.body.New.level).to.eql(res.body.Old.level);

                    chai.expect(res.body.New.spells).to.eql(res.body.Old.spells);

                    done()
                })
            })
    })

})