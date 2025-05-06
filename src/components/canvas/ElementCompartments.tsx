
import React from "react";
import { Element } from "../../model/types";

interface ElementCompartmentsProps {
  element: Element;
}

/**
 * Component for rendering element compartments based on SysML v2 element type
 */
export const ElementCompartments: React.FC<ElementCompartmentsProps> = ({
  element
}) => {
  // Based on element type, render appropriate compartments
  switch (element.type) {
    case "Part":
    case "Class":
      return (
        <div className="compartments">
          {/* Properties compartment */}
          <div className="compartment properties-compartment">
            <div className="compartment-header">Properties</div>
            <div className="compartment-content">
              {renderProperties(element)}
            </div>
          </div>
          
          {/* Operations/Functions compartment */}
          <div className="compartment operations-compartment">
            <div className="compartment-header">Operations</div>
            <div className="compartment-content">
              {renderOperations(element)}
            </div>
          </div>
        </div>
      );
      
    case "State":
      return (
        <div className="compartments">
          <div className="compartment internal-actions-compartment">
            <div className="compartment-header">Internal Actions</div>
            <div className="compartment-content">
              {renderInternalActions(element)}
            </div>
          </div>
        </div>
      );
      
    case "Requirement":
      return (
        <div className="compartments">
          <div className="compartment requirement-details-compartment">
            <div className="compartment-content">
              <div className="requirement-id">{element.properties?.reqId || "ID: TBD"}</div>
              <div className="requirement-priority">
                Priority: {element.properties?.priority || "Medium"}
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      // For other element types, just render the description
      return (
        <div className="compartments">
          <div className="compartment description-compartment">
            <div className="compartment-content">
              {element.description || "No description"}
            </div>
          </div>
        </div>
      );
  }
};

/**
 * Helper to render properties based on element type
 */
const renderProperties = (element: Element) => {
  const properties = [];
  
  // If element has explicit properties defined, render them
  if (element.properties) {
    for (const [key, value] of Object.entries(element.properties)) {
      if (key !== 'reqId' && key !== 'priority') {
        properties.push(
          <div key={key} className="property">
            {key}: {value}
          </div>
        );
      }
    }
  }
  
  if (properties.length === 0) {
    return <div className="empty-compartment">No properties</div>;
  }
  
  return properties;
};

/**
 * Helper to render operations
 */
const renderOperations = (element: Element) => {
  // For now, we don't have operations data
  // This would come from a more complete metamodel implementation
  return <div className="empty-compartment">No operations</div>;
};

/**
 * Helper to render internal actions for states
 */
const renderInternalActions = (element: Element) => {
  const actions = [];
  
  // Common state actions
  if (element.properties?.isInitial === "true") {
    actions.push(
      <div key="initial" className="internal-action">
        <span className="action-type">entry:</span> initialize
      </div>
    );
  }
  
  if (element.properties?.isFinal === "true") {
    actions.push(
      <div key="final" className="internal-action">
        <span className="action-type">exit:</span> finalize
      </div>
    );
  }
  
  if (actions.length === 0) {
    return <div className="empty-compartment">No actions</div>;
  }
  
  return actions;
};
