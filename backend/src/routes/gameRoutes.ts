import {Router} from 'express';
import { createGameController, getActiveGamesController, getGameController, joinGameController, makeMoveController } from '../controllers/gameController';



const router = Router();

router.post('/', createGameController);
router.get('/player/:playerId/active', getActiveGamesController);
router.post('/:gameId/join', joinGameController);
router.post('/:gameId/move',makeMoveController)
router.get('/:gameId', getGameController);


export default router;