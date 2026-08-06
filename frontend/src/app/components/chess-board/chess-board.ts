import { NgFor,NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Piece } from '../../models/piece-model';
import { ChessPiece } from '../chess-piece/chess-piece';
import { InitialPieces } from '../../data/initial-pieces';
import { CommonModule } from '@angular/common';
import { ChessEngine } from '../../services/chess-engine';
import { OnInit } from '@angular/core';
import { Move } from '../../models/move-model';

@Component({
  selector: 'app-chess-board',
  imports: [NgFor,ChessPiece,NgIf],
  templateUrl: './chess-board.html',
  styleUrl: './chess-board.scss',
})
export class ChessBoard {

  rows = [8, 7, 6, 5, 4, 3, 2, 1];
  columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  constructor(private chessEngine: ChessEngine){}
  
  pieces: Piece[] = [];
  possibleMoves: string[] = [];

  promotionVisible = false;
  isPromotionPending = false;
  promotionPawn: Piece | null = null;

  ngOnInit(){
    this.chessEngine.startGame()

    this.pieces = this.chessEngine.getGameState().pieces;
  }

  selectedPiece: Piece | null = null;

  selectPiece(piece: Piece){

    if(this.isPromotionPending)
      return;

    const canSelect= this.chessEngine.selectPiece(piece);
    
    if(!canSelect)
      return;
    else
      this.selectedPiece = piece;

      this.possibleMoves = this.chessEngine.getPossibleMoves(piece);
      console.log(this.possibleMoves);

  }

  getPiece(position: string): Piece | undefined {

    return this.pieces.find(
      piece => piece.position === position
    );

  }

  //Realiza el movimiento que el usuario eligio dentro de lo permitido
  move(position: string){
    if(this.isPromotionPending)
      return;
    
    if(!this.selectedPiece)
      return;

    if(this.possibleMoves.includes(position)){
      if(this.chessEngine.movePiece(this.selectedPiece,position)){
        //Coronacion o Enroque
        if(this.chessEngine.getPiece(position)?.name === 'pawn'){
          this.promotionPawn = this.selectedPiece;
          this.promotionVisible = true;
          this.isPromotionPending = true;
          this.pieces = this.chessEngine.getGameState().pieces;
          this.possibleMoves = [];

          return;
        }
      }
        
        
      this.pieces = this.chessEngine.getGameState().pieces;

      this.selectedPiece = null;
      this.possibleMoves = [];

      this.chessEngine.changeTurn()
    }
  }

  //Cuando hay una coronacion se encarga de cambiar la pieza en el tablero y mandarsela al motor para que la actualice
  promotePawn(pieceName: string){
    if(!this.promotionPawn)
      return;

    this.chessEngine.promotePawn(this.promotionPawn,pieceName);
    this.pieces = this.chessEngine.getGameState().pieces;

    this.promotionPawn = null;
    this.promotionVisible = false;
    this.isPromotionPending = false;
    
    this.selectedPiece = null;
    this.possibleMoves = [];
    
    this.chessEngine.changeTurn()

  }
  

}
