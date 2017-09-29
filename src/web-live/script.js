$(function main() {

    var league = Utils.getQueryString('league');
    Api.setLeague(league);

    var teamId = Utils.getQueryString('teamId') || Api.getTeamId(Utils.getQueryString('team'));
    Api.setTeamId(teamId);

    initGame();
    function initGame() {
        Api.getTodaysGame(todaysGame => {
            if (todaysGame) {
                var gameId = todaysGame.id;
                var gameStart = new Date(todaysGame.date);
                var status = todaysGame.status.name;
                var score = todaysGame.score;

                Api.getTeamInfo(todaysGame.homeTeam.id, t => Render.teamInfo(t, true));
                Api.getTeamInfo(todaysGame.awayTeam.id, t => Render.teamInfo(t, false));

                if (status == 'Pregame') {
                    Render.pregame(gameStart);

                    var timeout = Math.round((gameStart.getTime() - new Date().getTime()) * .9);
                    timeout = timeout < 10000 ? 10000 : timeout;
                    Utils.setTimeout(initGame, timeout, status);
                }
                else if (status == 'In Progress') {
                    updateGame();
                    function updateGame() {
                        Api.getGameState(gameId, gameState => {
                            if (gameState.Status == 'In Progress') {
                                Render.gameState(gameState);
                                Utils.setTimeout(updateGame, 5 * 1000, gameState.Status);
                            }
                            else {
                                initGame();
                            }
                        })
                    }
                }
                else if (status == 'Final') {
                    Render.gameFinal(score);
                    Utils.setTimeout(initGame, 4 * 60 * 60 * 1000, status);
                }
                else if (status == 'Delayed') {
                    Render.gameDelayed(score);
                    Utils.setTimeout(initGame, 5 * 60 * 1000, status);
                }
                else {
                    Utils.setTimeout(initGame, 10 * 60 * 1000, status);
                }
            }
            else {
                Render.noGame();
                Utils.setTimeout(initGame, 4 * 60 * 60 * 1000, 'No game today');
            }
        });
    }
});