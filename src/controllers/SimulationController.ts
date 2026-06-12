import { Request, Response } from "express";
import { SimulationService } from "../services/simulationService";

export class SimulationController {
  static start(req: Request, res: Response) {
    SimulationService.start();
    res.json({
      success: true,
      message: "Simulation started",
      data: { running: true },
    });
  }

  static stop(req: Request, res: Response) {
    SimulationService.stop();
    res.json({
      success: true,
      message: "Simulation stopped",
      data: { running: false },
    });
  }

  static status(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        running: SimulationService.isRunning(),
        activeVehicles: SimulationService.activeCount(),
      },
    });
  }

  static refresh(req: Request, res: Response) {
    SimulationService.refreshRoutes();
    res.json({
      success: true,
      message: "Routes refreshed",
    });
  }
}
