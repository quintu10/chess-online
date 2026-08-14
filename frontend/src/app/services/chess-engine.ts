import { Injectable } from '@angular/core';
import { Piece } from '../models/piece-model';
import { GameState } from '../models/game-state-model';
import { InitialPieces } from '../data/initial-pieces';
import { Move } from '../models/move-model';
import { getPawnMoves } from '../rules/pawn-rules';
import { from, last, lastValueFrom } from 'rxjs';
import { getRookMoves } from '../rules/rook-rules';
import { getBishopMoves } from '../rules/bishop-rules';
import { getQueenMoves } from '../rules/queen-rules';
import { getKingMoves } from '../rules/king-rules';
import { getKnightMoves } from '../rules/knight-rules';
import { moveBackup } from '../models/move-backup';

@Injectable({
  providedIn: 'root',
})
export class ChessEngine {

  private gameState!: GameState;

  
  //Inicia el juego
  public startGame(){
    this.gameState = {
      pieces: InitialPieces.map(piece => ({...piece})),
      turn: 'white',
      status:'playing',
      lastMove: null,
    };
  }

  //Devuelve el estado del juego(de quien es el turno, arraid de todas las piezas en el tablero, estado de la partida y el ultimo movimiento)
  public getGameState() : GameState{
    return this.gameState;
  }

  //Le damos una pieza y nos devuelve verdadero si es del color que le corresponde el turno  
  public selectPiece(piece: Piece): boolean{
    if(piece.color !== this.gameState.turn)
      return false
    else  
      return true
  }


  //Recibe una posicion del tablero y nos devuelve la pieza que esta en esa posicion y si no hay nada devuelve undefined    
  public getPiece(position: string): Piece | undefined{

    return this.gameState.pieces.find(
      piece => piece.position === position
    );
    
  }

  
  //Recibe una pieza y nos devuelve todos sus movimientos posibles
  private getPossibleMoves(piece:Piece): string[]{
     
    if(piece.name === 'pawn')
      return getPawnMoves(piece,this.getGameState(),this.getPiece.bind(this));
    if(piece.name === 'rook')
      return getRookMoves(piece,this.getGameState(),this.getPiece.bind(this))
    if(piece.name === 'bishop')
      return getBishopMoves(piece,this.getGameState(),this.getPiece.bind(this))
    if(piece.name === 'queen')
      return getQueenMoves(piece,this.getGameState(),this.getPiece.bind(this))
    if(piece.name === 'king')
      return getKingMoves(piece,this.getGameState(),this.getPiece.bind(this))
    if(piece.name === 'knight')
      return getKnightMoves(piece,this.getGameState(),this.getPiece.bind(this))

    return [];
    
  }

  //Filtra los movimientos posibles para ver si estos son legales, por jaques al rey, piezas clavadas, etc
  public getLegalMoves(piece: Piece): string[]{
    const moves = this.getPossibleMoves(piece);
    const legalMoves: string[] =[];
    
    for(let i = 0; i < moves.length ; i++){
      
      const backup = this.makeMove(piece,moves[i]);
      const king = this.gameState.pieces.find(
        p => p.name === 'king' && p.color === piece.color
      )
      if(king){
        const enemyColor = piece.color === 'white' ? 'black' : 'white';
        if(!this.isKingInCheck(king.position, enemyColor))
          legalMoves.push(moves[i])
      }    
          
      this.undoMove(piece,backup);
    }

    return legalMoves;
  }

  //cambia el turno del estado del juego
  public changeTurn(){
    if(this.gameState.turn === 'white')
      this.gameState.turn = 'black';
    else if(this.gameState.turn === 'black')
      this.gameState.turn = 'white';  
  }


  //Recibe una pieza y la mueve hacia la posicion q recibio
  public movePiece(piece: Piece, newPosition: string): boolean{
    
    const targetPiece = this.gameState.pieces.find(
      p => p.position === newPosition
    )
    
    const isPassantMove = this.checkInPassantMove(piece, newPosition);
    if(isPassantMove){
      const direccion = piece.color === 'white' ? -1 : 1;
      const targetPiece = this.gameState.pieces.find(
        p => p.position === (newPosition[0] + (Number(newPosition[1]) + direccion))
      )
      
      if(targetPiece?.name === 'pawn'){
        this.gameState.pieces = this.gameState.pieces.filter(
          p => p.id !== targetPiece.id
        )
      }
    }

    if(targetPiece){
      this.gameState.pieces = this.gameState.pieces.filter(
        p => p.id  !== targetPiece.id
      )
    }

    const isCastling = this.checkCastling(piece, newPosition);

    this.gameState.lastMove = {
      from: piece.position,
      to: newPosition,
    }
    piece.position = newPosition;
    piece.hasMoved = true;

    const enemyColor = piece.color === 'white' ? 'black' : 'white';

    if(this.isCheckMate(enemyColor)){
        console.log('Jaque mate');
        this.gameState.status = 'checkmate';
        return false;
    }

    if(this.isStalemate(enemyColor)){
      console.log('Rey ahogado');
      this.gameState.status = 'draw';
      return false;
    }

    if(piece.name === 'pawn')
      return this.checkPromotion(piece);

    return isCastling;
  }

  //Verifica si hay una coronacion de peon y lo dejamos en privado ya que solo lo utilizamos dentro de nuestro motor
  private checkPromotion(piece: Piece): boolean{
    
    if(piece.name !== 'pawn')
        return false;

    const promotionRow = piece.color === 'white' ? 8 : 1;

    const row = Number(piece.position[1]);

    if(row === promotionRow){
      //Coronacion
      return true;
    }else
      return false ; // No hay coronacion 
    
  }

  //Recibe el peon que corono y nos devuelve el tipo de pieza que eligio el usuario  
  public promotePawn(promotePawn: Piece, newPieceType: string){
    if(newPieceType === 'queen'){
      promotePawn.name = 'queen'
      promotePawn.symbol = promotePawn.color === 'white' ?  '♕' : '♛';
    }
    if(newPieceType === 'rook'){
      promotePawn.name = 'rook'
      promotePawn.symbol = promotePawn.color === 'white' ?  '♖' : '♜';
    }
    if(newPieceType === 'bishop'){
      promotePawn.name = 'bishop'
      promotePawn.symbol = promotePawn.color === 'white' ?  '♗' : '♝';
    }
    
    if(newPieceType === 'knight'){
      promotePawn.name = 'knight'
      promotePawn.symbol = promotePawn.color === 'white' ?  '♘' : '♞';
    }   
  }

  //Recibe una pieza y si es un peon chequea si esta comiendo al paso 
  private checkInPassantMove(piece: Piece, newPosition: string): boolean{
    if(piece.name !== 'pawn')
      return false;

    if(piece.position[0] === newPosition[0])
      return false;

    const targetPiece = this.gameState.pieces.find(
      p => p.position === newPosition
    )

    if(targetPiece){
      return false;
    }

    const direction = piece.color === 'white' ? -1 : 1;
    const inPassantPiecePosition = newPosition[0] + (Number(newPosition[1]) + direction) 
    const passantPiece = this.gameState.pieces.find(
      p => p.position === inPassantPiecePosition
    )

    if(!passantPiece)
      return false;

    if(passantPiece.color === piece.color)
      return false;

    if(passantPiece.name === 'pawn')
      return true;

    return false;

  }

  //Recibe una pieza y si es el rey chequea si esta enrocando
  private checkCastling(piece: Piece, newPosition: string): boolean {

      if(piece.name !== 'king')
          return false;

      const row = piece.color === 'white' ? 1 : 8;

      if(piece.position === ('E' + row) && newPosition === ('G' + row)){
          const rookKing = this.gameState.pieces.find(
              p => p.position === ('H' + row)
          );

          if(rookKing){
              rookKing.position = 'F' + row;
              rookKing.hasMoved = true;
              return true;
          }
      }

      if(piece.position === ('E' + row) && newPosition === ('C' + row)){
          const rookQueen = this.gameState.pieces.find(
              p => p.position === ('A' + row)
          );

          if(rookQueen){
              rookQueen.position = 'D' + row;
              rookQueen.hasMoved = true;
              return true;
          }
      }
      
      return false;
  }

  //Recibe una posicion y nos filtra si esta siendo atacada  
  private isSquareAttacked(position: string, attackingColor: string): boolean{
    
    const attackingPieces = this.gameState.pieces.filter(
      p => p.color === attackingColor
    );

    let possibleMoves: string[] = [];

    for( let i = 0; i < attackingPieces.length; i++){
      possibleMoves = this.getPossibleMoves(attackingPieces[i])

      if(possibleMoves.includes(position))
        return true;
    }

    return false;

  }

  //Recibe la posicion del rey y chequea si esta en jaque
  private isKingInCheck(kingPosition: string, attackingColor: string): boolean{
    if(this.isSquareAttacked(kingPosition,attackingColor)){
      return true;
    }
    
    return false;
  }

  private isCheckMate(color: string):boolean{
    const king = this.gameState.pieces.find(
      p => p.color === color && p.name === 'king'
    );

    const enemyColor = color === 'white' ? 'black' : 'white';

    if(!king)
      return false;
      
    if(!this.isKingInCheck(king.position,enemyColor))
      return false;
    
    const colorPieces = this.gameState.pieces.filter(
      p => p.color === color
    )

    for( let i = 0; i < colorPieces.length; i++ ){
      const legalMoves = this.getLegalMoves(colorPieces[i]);

      if(legalMoves.length > 0 )
        return false
    }
    

    return true;
  }

  private isStalemate(color: string):boolean{
    const king = this.gameState.pieces.find(
      p => p.color === color && p.name === 'king'
    );

    const enemyColor = color === 'white' ? 'black' : 'white';

    if(!king)
      return false;
      
    if(this.isKingInCheck(king.position,enemyColor))
      return false;
    
    const colorPieces = this.gameState.pieces.filter(
      p => p.color === color
    )

    for( let i = 0; i < colorPieces.length; i++ ){
      const legalMoves = this.getLegalMoves(colorPieces[i]);

      if(legalMoves.length > 0 )
        return false
    }
    

    return true;
      
  }

  //Recibe una pieza y una posiocion para simular un movimiento y guardarnos un backup para devolverlo con undoMove()
  private makeMove(piece: Piece,newPosition: string): moveBackup{
    const backup: moveBackup = {
      piece: piece,
      oldPosition: piece.position,
      hasMoved: piece.hasMoved,
      lastMove: this.gameState.lastMove,
    };

    const capturedPiece = this.gameState.pieces.find(
      p => p.position === newPosition
    );

    if(capturedPiece){
      backup.capturedPiece = capturedPiece;

      this.gameState.pieces = this.gameState.pieces.filter(
        p => p.id !== capturedPiece.id
      )
    }

    piece.position = newPosition;
    piece.hasMoved = true;

    this.gameState.lastMove = {
      from: backup.oldPosition,
      to: newPosition,
    };


    //Para guardarnos en el backup la torre en caso de que sea un movimiento de enroque
    if(piece.name === 'king'){

      const row = piece.color === 'white' ? 1 : 8;

      //Enoque corto
      if(backup.oldPosition === ('E' + row) && newPosition === ('G' + row) ){
        const rook = this.gameState.pieces.find(
          p => p.position === ('F' + row)
        )

        if(rook){
          backup.rook = rook;
          backup.rookOldPosition = rook.position;
          backup.rookHasMoved = false;
          
          rook.position = ('C' + row)
          rook.hasMoved = true;
        }
      }

      //Enroque largo
      if(piece.position === ('E' + row)){
        const rook = this.gameState.pieces.find(
          p => p.position === ('D' + row)
        )

        if(rook){
          backup.rook = rook;
          backup.rookOldPosition = rook.position;
          backup.rookHasMoved = false;
          
          rook.position = ('D' + row)
          rook.hasMoved = true;
        }
      }

    }

    return backup;
  } 

  //Recibe una pieza y una backup y devuelve el movimiento simulado anteriormente
  private undoMove(piece: Piece, backup: moveBackup){
    piece.position = backup.oldPosition;
    piece.hasMoved = backup.hasMoved;
    this.gameState.lastMove = backup.lastMove;

    if(backup.capturedPiece){
      this.gameState.pieces.push(backup.capturedPiece)
    }
    if(backup.rook){
      backup.rook.position = String(backup.rookOldPosition);
      backup.rook.hasMoved = Boolean(backup.rookHasMoved);
    }
  }

}
