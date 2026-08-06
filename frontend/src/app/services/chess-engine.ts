import { Injectable } from '@angular/core';
import { Piece } from '../models/piece-model';
import { GameState } from '../models/game-state-model';
import { InitialPieces } from '../data/initial-pieces';
import { Move } from '../models/move-model';
import { getPawnMoves } from '../rules/pawn-rules';
import { last, lastValueFrom } from 'rxjs';
import { getRookMoves } from '../rules/rook-rules';
import { getBishopMoves } from '../rules/bishop-rules';
import { getQueenMoves } from '../rules/queen-rules';
import { getKingMoves } from '../rules/king-rules';

@Injectable({
  providedIn: 'root',
})
export class ChessEngine {

  private gameState!: GameState;

  
  //Inicia el juego
  public startGame(){
    this.gameState = {
      pieces: InitialPieces,
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
  public getPossibleMoves(piece:Piece): string[]{
     
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

    return [];
    
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

    if(targetPiece){
      this.gameState.pieces = this.gameState.pieces.filter(
        p => p.id  !== targetPiece.id
      )
    }
    
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

    const isCastling = this.checkCastling(piece, newPosition);

    this.gameState.lastMove = {
      from: piece.position,
      to: newPosition,
    }
    piece.position = newPosition;

    

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

  checkInPassantMove(piece: Piece, newPosition: string): boolean{
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

    if(passantPiece.name === 'pawn')
      return true;

    return false;

  }

  checkCastling(piece: Piece, newPosition: string): boolean {

      if(piece.name !== 'king')
          return false;

      const row = piece.color === 'white' ? 1 : 8;

      if(piece.position === ('E' + row) && newPosition === ('G' + row)){
          const rookKing = this.gameState.pieces.find(
              p => p.position === ('H' + row)
          );

          if(rookKing){
              rookKing.position = 'F' + row;
              return true;
          }
      }

      if(piece.position === ('E' + row) && newPosition === ('C' + row)){
          const rookQueen = this.gameState.pieces.find(
              p => p.position === ('A' + row)
          );

          if(rookQueen){
              rookQueen.position = 'D' + row;
              return true;
          }
      }
      
      return false;
  }

}
