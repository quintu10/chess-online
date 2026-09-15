import {Router} from 'express';
import { getActiveGamesController, getGameController,
         makeMoveController,joinMatchmakingController, 
         cancelMatchmakingController} from '../controllers/gameController';



const router = Router();

router.post('/matchmaking',joinMatchmakingController);
router.delete('/matchmaking',cancelMatchmakingController);
router.get('/player/:playerId/active', getActiveGamesController);
router.post('/:gameId/move',makeMoveController)
router.get('/:gameId', getGameController);



export default router;