"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = require("dotenv");
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
}
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, competition_1, competitionError, teams, _b, createdTeams, teamsError, competitionTeams, linkError, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, supabase
                            .from('competitions')
                            .insert([{
                                name: 'Nigeria Pro Club League',
                                type: 'league',
                                status: 'active',
                                start_date: new Date().toISOString(),
                                end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
                            }])
                            .select()
                            .single()];
                case 1:
                    _a = _c.sent(), competition_1 = _a.data, competitionError = _a.error;
                    if (competitionError)
                        throw competitionError;
                    console.log('Created competition:', competition_1);
                    teams = [
                        { name: 'Nameless Chaos' },
                        { name: 'Menace FC' },
                        { name: 'As Tornado' },
                        { name: 'Get Clapped' },
                        { name: 'Martial XI' },
                        { name: 'Talker FC' },
                        { name: 'Adventure Time' },
                        { name: 'Effortless VFC' },
                        { name: 'Phoenix VFC' },
                        { name: 'Galaxy 11' },
                        { name: 'Faceless Men XI' },
                        { name: 'Curryz FC' }
                    ];
                    return [4 /*yield*/, supabase
                            .from('teams')
                            .insert(teams)
                            .select()];
                case 2:
                    _b = _c.sent(), createdTeams = _b.data, teamsError = _b.error;
                    if (teamsError)
                        throw teamsError;
                    console.log('Created teams:', createdTeams);
                    competitionTeams = createdTeams.map(function (team) { return ({
                        competition_id: competition_1.id,
                        team_id: team.id,
                        status: 'active'
                    }); });
                    return [4 /*yield*/, supabase
                            .from('competition_teams')
                            .insert(competitionTeams)];
                case 3:
                    linkError = (_c.sent()).error;
                    if (linkError)
                        throw linkError;
                    console.log('Successfully linked teams to competition');
                    console.log('Successfully added Nigeria Pro Club League and teams!');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _c.sent();
                    console.error('Error:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
main();
