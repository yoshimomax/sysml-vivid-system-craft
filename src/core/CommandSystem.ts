
import { Element, Relationship } from "../model/types";

/**
 * Command interface for the command pattern
 */
export interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
  getDescription(): string;
}

/**
 * CommandHistory manages the command execution history
 * and provides undo/redo capabilities
 */
export class CommandHistory {
  private commands: Command[] = [];
  private currentIndex: number = -1;
  
  /**
   * Execute a command and add it to history
   */
  execute(command: Command): void {
    // Remove any future commands (for cases after undo)
    if (this.currentIndex < this.commands.length - 1) {
      this.commands = this.commands.slice(0, this.currentIndex + 1);
    }
    
    // Execute the command
    command.execute();
    
    // Add to history
    this.commands.push(command);
    this.currentIndex = this.commands.length - 1;
  }
  
  /**
   * Undo the last executed command
   */
  undo(): void {
    if (this.canUndo()) {
      const command = this.commands[this.currentIndex];
      command.undo();
      this.currentIndex--;
    }
  }
  
  /**
   * Redo the previously undone command
   */
  redo(): void {
    if (this.canRedo()) {
      this.currentIndex++;
      const command = this.commands[this.currentIndex];
      command.redo();
    }
  }
  
  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }
  
  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }
  
  /**
   * Clear command history
   */
  clear(): void {
    this.commands = [];
    this.currentIndex = -1;
  }
  
  /**
   * Get the command history
   */
  getHistory(): {description: string; current: boolean}[] {
    return this.commands.map((cmd, index) => ({
      description: cmd.getDescription(),
      current: index === this.currentIndex
    }));
  }
}

// Create a singleton command history
export const commandHistory = new CommandHistory();
